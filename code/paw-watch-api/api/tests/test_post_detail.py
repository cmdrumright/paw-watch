from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class PostDetailTests(APITestCase):
    """Tests for GET /api/posts/<id> using the users and posts fixtures."""

    fixtures = ["users", "posts"]

    def setUp(self):
        self.user = User.objects.get(email="jane@example.com")
        self.client.force_authenticate(user=self.user)

    def test_retrieve_returns_200(self):
        """A valid post ID returns 200 with the post detail."""
        res = self.client.get("/api/posts/1")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["id"], 1)

    def test_retrieve_includes_full_fields(self):
        """The detail response includes all post fields."""
        res = self.client.get("/api/posts/1")

        for field in ["id", "type", "status", "pet_name", "species", "breed",
                      "color", "description", "incident_date", "location_lat",
                      "location_lng", "location_label", "created_at", "updated_at"]:
            self.assertIn(field, res.data)

    def test_retrieve_includes_owner_info(self):
        """The detail response includes the owner's id, display_name, and avatar_url."""
        res = self.client.get("/api/posts/1")

        owner = res.data["owner"]
        self.assertIn("id", owner)
        self.assertIn("display_name", owner)
        self.assertIn("avatar_url", owner)
        self.assertEqual(owner["display_name"], "Jane D.")

    def test_retrieve_includes_photos_list(self):
        """The detail response includes a photos list (empty when no photos are attached)."""
        res = self.client.get("/api/posts/1")

        self.assertIn("photos", res.data)
        self.assertIsInstance(res.data["photos"], list)

    def test_retrieve_includes_comment_count(self):
        """The detail response includes a comment_count field."""
        res = self.client.get("/api/posts/1")

        self.assertIn("comment_count", res.data)
        self.assertEqual(res.data["comment_count"], 0)

    def test_retrieve_unknown_id_returns_404(self):
        """Requesting a post ID that does not exist returns 404."""
        res = self.client.get("/api/posts/9999")

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_requires_authentication(self):
        """Unauthenticated requests to the post detail return 401."""
        self.client.force_authenticate(user=None)
        res = self.client.get("/api/posts/1")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
