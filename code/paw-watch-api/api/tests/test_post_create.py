import io
from PIL import Image

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Post, PostPhoto
from api.tests.base import TempMediaMixin

User = get_user_model()


def _fake_image(name="test.jpg"):
    """Return an in-memory JPEG file object suitable for multipart upload."""
    buf = io.BytesIO()
    img = Image.new("RGB", (10, 10), color=(255, 0, 0))
    img.save(buf, format="JPEG")
    buf.seek(0)
    buf.name = name
    return buf


VALID_PAYLOAD = {
    "type": "lost",
    "pet_name": "Rex",
    "species": "dog",
    "breed": "Labrador",
    "color": "black",
    "description": "Last seen near the park.",
    "incident_date": "2026-05-01",
    "location_lat": "36.5298",
    "location_lng": "-87.3595",
    "location_label": "Clarksville, TN",
}


class PostCreateTests(TempMediaMixin, APITestCase):
    """Tests for POST /api/posts."""

    fixtures = ["users", "posts"]

    def setUp(self):
        self.user = User.objects.get(email="jane@example.com")
        self.client.force_authenticate(user=self.user)

    def test_create_returns_201(self):
        """A valid payload creates a post and returns 201."""
        res = self.client.post("/api/posts", VALID_PAYLOAD, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_returns_post_detail(self):
        """The response body matches the post detail shape."""
        res = self.client.post("/api/posts", VALID_PAYLOAD, format="multipart")

        for field in ["id", "type", "status", "pet_name", "species", "breed", "color",
                      "description", "incident_date", "location_lat", "location_lng",
                      "location_label", "created_at", "updated_at", "owner", "photos",
                      "comment_count"]:
            self.assertIn(field, res.data)

    def test_create_saves_post_to_database(self):
        """The new post is persisted with the correct field values."""
        res = self.client.post("/api/posts", VALID_PAYLOAD, format="multipart")

        post = Post.objects.get(pk=res.data["id"])
        self.assertEqual(post.pet_name, "Rex")
        self.assertEqual(post.owner, self.user)
        self.assertEqual(post.status, Post.Status.ACTIVE)

    def test_create_with_photos_saves_photos(self):
        """Uploading images creates Photo records linked to the post."""
        payload = {**VALID_PAYLOAD, "photos": [_fake_image("a.jpg"), _fake_image("b.jpg")]}
        res = self.client.post("/api/posts", payload, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        post_id = res.data["id"]
        self.assertEqual(PostPhoto.objects.filter(post_id=post_id).count(), 2)
        self.assertEqual(len(res.data["photos"]), 2)

    def test_create_without_photos_returns_empty_photos_list(self):
        """A post created without images returns an empty photos array."""
        res = self.client.post("/api/posts", VALID_PAYLOAD, format="multipart")

        self.assertEqual(res.data["photos"], [])

    def test_create_more_than_4_photos_returns_400(self):
        """Submitting more than 4 photos returns a 400 validation error."""
        payload = {
            **VALID_PAYLOAD,
            "photos": [_fake_image(f"{i}.jpg") for i in range(5)],
        }
        res = self.client.post("/api/posts", payload, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_missing_required_field_returns_400(self):
        """Omitting a required field returns 400."""
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "pet_name"}
        res = self.client.post("/api/posts", payload, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("pet_name", res.data)

    def test_create_requires_authentication(self):
        """Unauthenticated requests return 401."""
        self.client.force_authenticate(user=None)
        res = self.client.post("/api/posts", VALID_PAYLOAD, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
