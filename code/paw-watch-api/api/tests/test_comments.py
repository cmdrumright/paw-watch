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
