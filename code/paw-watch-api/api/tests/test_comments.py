import io
from PIL import Image

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Comment, CommentPhoto, Post

User = get_user_model()


def _fake_image(name="test.jpg"):
    buf = io.BytesIO()
    img = Image.new("RGB", (10, 10), color=(0, 128, 0))
    img.save(buf, format="JPEG")
    buf.seek(0)
    buf.name = name
    return buf


def _make_user(email="user@example.com", display_name="Test User"):
    return User.objects.create_user(
        username=email, email=email, password="pass", display_name=display_name
    )


def _make_post(owner):
    return Post.objects.create(
        owner=owner,
        type="lost",
        pet_name="Rex",
        species="Dog",
        breed="Lab",
        color="Black",
        description="Missing.",
        incident_date="2026-05-01",
        location_lat=36.5,
        location_lng=-87.3,
        location_label="Clarksville, TN",
    )


class CommentListTest(APITestCase):
    def setUp(self):
        self.user = _make_user()
        self.post = _make_post(self.user)
        self.url = f"/api/posts/{self.post.pk}/comments"
        self.client.force_authenticate(user=self.user)

    def test_list_empty(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, [])

    def test_list_returns_comments(self):
        Comment.objects.create(post=self.post, author=self.user, body="First comment")
        Comment.objects.create(post=self.post, author=self.user, body="Second comment")
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        self.assertEqual(res.data[0]["body"], "First comment")
        self.assertEqual(res.data[1]["body"], "Second comment")

    def test_list_includes_author_info(self):
        Comment.objects.create(post=self.post, author=self.user, body="Hi")
        res = self.client.get(self.url)
        author = res.data[0]["author"]
        self.assertEqual(author["id"], self.user.pk)
        self.assertEqual(author["display_name"], self.user.display_name)

    def test_list_includes_photos(self):
        comment = Comment.objects.create(post=self.post, author=self.user, body="With photo")
        from api.models import Photo, CommentPhoto
        photo = Photo.objects.create(file_path="photos/test.jpg", order=0)
        CommentPhoto.objects.create(comment=comment, photo=photo)
        res = self.client.get(self.url)
        self.assertEqual(len(res.data[0]["photos"]), 1)

    def test_list_404_for_unknown_post(self):
        res = self.client.get("/api/posts/9999/comments")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_requires_auth(self):
        self.client.force_authenticate(user=None)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class CommentCreateTest(APITestCase):
    def setUp(self):
        self.user = _make_user()
        self.post = _make_post(self.user)
        self.url = f"/api/posts/{self.post.pk}/comments"
        self.client.force_authenticate(user=self.user)

    def test_create_basic_comment(self):
        res = self.client.post(self.url, {"body": "I saw this dog!"}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["body"], "I saw this dog!")
        self.assertEqual(res.data["author"]["id"], self.user.pk)
        self.assertEqual(Comment.objects.count(), 1)

    def test_create_with_sighting_coords(self):
        payload = {"body": "Spotted here.", "sighting_lat": 36.52, "sighting_lng": -87.36}
        res = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["sighting_lat"], 36.52)
        self.assertEqual(res.data["sighting_lng"], -87.36)

    def test_create_with_photos(self):
        payload = {"body": "Here's a photo.", "photos": [_fake_image("a.jpg"), _fake_image("b.jpg")]}
        res = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(res.data["photos"]), 2)
        self.assertEqual(CommentPhoto.objects.count(), 2)

    def test_create_too_many_photos(self):
        payload = {
            "body": "Too many.",
            "photos": [_fake_image("a.jpg"), _fake_image("b.jpg"), _fake_image("c.jpg")],
        }
        res = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("photos", res.data)

    def test_create_missing_body(self):
        res = self.client.post(self.url, {}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("body", res.data)

    def test_create_404_for_unknown_post(self):
        res = self.client.post("/api/posts/9999/comments", {"body": "Hi"}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_requires_auth(self):
        self.client.force_authenticate(user=None)
        res = self.client.post(self.url, {"body": "Hi"}, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class CommentDeleteTest(APITestCase):
    def setUp(self):
        self.author = _make_user("author@example.com", "Author")
        self.other = _make_user("other@example.com", "Other")
        self.admin = _make_user("admin@example.com", "Admin")
        self.admin.role = self.admin.Role.ADMIN
        self.admin.save()
        self.post = _make_post(self.author)
        self.comment = Comment.objects.create(
            post=self.post, author=self.author, body="Delete me."
        )
        self.url = f"/api/comments/{self.comment.pk}"

    def test_author_can_delete(self):
        self.client.force_authenticate(user=self.author)
        res = self.client.delete(self.url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)

    def test_admin_can_delete(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(self.url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)

    def test_other_user_gets_403(self):
        self.client.force_authenticate(user=self.other)
        res = self.client.delete(self.url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Comment.objects.count(), 1)

    def test_unauthenticated_gets_401(self):
        res = self.client.delete(self.url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_unknown_comment_gets_404(self):
        self.client.force_authenticate(user=self.author)
        res = self.client.delete("/api/comments/9999")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class CommentConfirmSightingTest(APITestCase):
    def setUp(self):
        self.owner = _make_user("owner@example.com", "Owner")
        self.other = _make_user("other@example.com", "Other")
        self.post = _make_post(self.owner)
        self.comment_with_sighting = Comment.objects.create(
            post=self.post,
            author=self.other,
            body="I saw it!",
            sighting_lat=36.52,
            sighting_lng=-87.36,
        )
        self.comment_no_sighting = Comment.objects.create(
            post=self.post,
            author=self.other,
            body="Just a comment, no location.",
        )

    def _url(self, comment):
        return f"/api/comments/{comment.pk}/confirm"

    def test_owner_can_confirm_sighting(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch(self._url(self.comment_with_sighting), format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_confirmed_sighting"])

    def test_confirms_sets_post_status_to_sighting_reported(self):
        self.client.force_authenticate(user=self.owner)
        self.client.patch(self._url(self.comment_with_sighting), format="json")
        self.post.refresh_from_db()
        self.assertEqual(self.post.status, "sighting_reported")

    def test_non_owner_gets_403(self):
        self.client.force_authenticate(user=self.other)
        res = self.client.patch(self._url(self.comment_with_sighting), format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_comment_without_sighting_gets_400(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch(self._url(self.comment_no_sighting), format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_gets_401(self):
        res = self.client.patch(self._url(self.comment_with_sighting), format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unknown_comment_gets_404(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch("/api/comments/9999/confirm", format="json")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
