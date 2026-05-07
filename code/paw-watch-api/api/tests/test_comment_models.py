from django.contrib.auth import get_user_model
from django.test import TestCase

from api.models import Comment, CommentPhoto, Photo, Post

User = get_user_model()


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


class CommentModelTest(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.post = _make_post(self.user)

    def test_create_comment(self):
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            body="I think I saw this dog near Exit 11.",
        )
        self.assertEqual(comment.post, self.post)
        self.assertEqual(comment.author, self.user)
        self.assertEqual(comment.body, "I think I saw this dog near Exit 11.")
        self.assertIsNone(comment.sighting_lat)
        self.assertIsNone(comment.sighting_lng)
        self.assertFalse(comment.is_confirmed_sighting)
        self.assertIsNotNone(comment.created_at)

    def test_comment_with_sighting_coords(self):
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            body="Spotted near the park.",
            sighting_lat=36.52,
            sighting_lng=-87.36,
        )
        self.assertEqual(comment.sighting_lat, 36.52)
        self.assertEqual(comment.sighting_lng, -87.36)

    def test_comments_ordered_by_created_at(self):
        c1 = Comment.objects.create(post=self.post, author=self.user, body="First")
        c2 = Comment.objects.create(post=self.post, author=self.user, body="Second")
        comments = list(Comment.objects.filter(post=self.post))
        self.assertEqual(comments, [c1, c2])

    def test_comment_deleted_when_post_deleted(self):
        Comment.objects.create(post=self.post, author=self.user, body="Will be gone.")
        self.post.delete()
        self.assertEqual(Comment.objects.count(), 0)

    def test_comment_deleted_when_author_deleted(self):
        Comment.objects.create(post=self.post, author=self.user, body="Also gone.")
        self.user.delete()
        self.assertEqual(Comment.objects.count(), 0)


class CommentPhotoModelTest(TestCase):
    def setUp(self):
        self.user = _make_user()
        self.post = _make_post(self.user)
        self.comment = Comment.objects.create(
            post=self.post, author=self.user, body="With photo."
        )

    def test_attach_photo_to_comment(self):
        photo = Photo.objects.create(file_path="photos/test.jpg", order=0)
        cp = CommentPhoto.objects.create(comment=self.comment, photo=photo)
        self.assertEqual(cp.comment, self.comment)
        self.assertEqual(cp.photo, photo)

    def test_comment_photo_deleted_when_comment_deleted(self):
        photo = Photo.objects.create(file_path="photos/test.jpg", order=0)
        CommentPhoto.objects.create(comment=self.comment, photo=photo)
        self.comment.delete()
        self.assertEqual(CommentPhoto.objects.count(), 0)

    def test_comment_photos_ordered_by_photo_order(self):
        photo_b = Photo.objects.create(file_path="photos/b.jpg", order=1)
        photo_a = Photo.objects.create(file_path="photos/a.jpg", order=0)
        CommentPhoto.objects.create(comment=self.comment, photo=photo_b)
        CommentPhoto.objects.create(comment=self.comment, photo=photo_a)
        photos = [cp.photo for cp in self.comment.comment_photos.all()]
        self.assertEqual(photos, [photo_a, photo_b])
