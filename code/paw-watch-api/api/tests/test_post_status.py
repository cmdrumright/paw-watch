from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Post

User = get_user_model()


def _make_user(email="owner@example.com", display_name="Owner"):
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


class PostStatusTest(APITestCase):
    def setUp(self):
        self.owner = _make_user()
        self.other = _make_user("other@example.com", "Other")
        self.post = _make_post(self.owner)
        self.url = f"/api/posts/{self.post.pk}/status"

    def test_owner_can_set_status(self):
        self.client.force_authenticate(user=self.owner)
        for s in ["sighting_reported", "reunited", "closed", "active"]:
            res = self.client.patch(self.url, {"status": s}, format="json")
            self.assertEqual(res.status_code, status.HTTP_200_OK, s)
            self.assertEqual(res.data["status"], s)

    def test_returns_full_post_detail(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch(self.url, {"status": "reunited"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("pet_name", res.data)
        self.assertIn("owner", res.data)

    def test_invalid_status_returns_400(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch(self.url, {"status": "banana"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", res.data)

    def test_missing_status_returns_400(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch(self.url, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_owner_gets_403(self):
        self.client.force_authenticate(user=self.other)
        res = self.client.patch(self.url, {"status": "closed"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_gets_401(self):
        res = self.client.patch(self.url, {"status": "closed"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unknown_post_gets_404(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch("/api/posts/9999/status", {"status": "closed"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
