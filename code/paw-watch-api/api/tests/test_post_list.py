from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Post

User = get_user_model()

POSTS_URL = "/api/posts"


class PostListTests(APITestCase):
    """Tests for GET /api/posts using the users and posts fixtures."""

    fixtures = ["users", "posts"]

    def setUp(self):
        self.user = User.objects.get(email="jane@example.com")
        self.client.force_authenticate(user=self.user)

    def test_list_returns_active_and_sighting_reported_posts(self):
        """Default list includes active and sighting_reported posts (pks 1, 2, 3)."""
        res = self.client.get(POSTS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        returned_ids = {p["id"] for p in res.data}
        self.assertIn(1, returned_ids)
        self.assertIn(2, returned_ids)
        self.assertIn(3, returned_ids)

    def test_list_excludes_reunited_by_default(self):
        """Reunited post (pk 4) is not in the default list."""
        res = self.client.get(POSTS_URL)

        returned_ids = {p["id"] for p in res.data}
        self.assertNotIn(4, returned_ids)

    def test_list_excludes_closed_by_default(self):
        """Closed post (pk 5) is not in the default list."""
        res = self.client.get(POSTS_URL)

        returned_ids = {p["id"] for p in res.data}
        self.assertNotIn(5, returned_ids)

    def test_include_closed_param_returns_all_five_posts(self):
        """Passing include_closed=true returns all 5 fixture posts."""
        res = self.client.get(POSTS_URL, {"include_closed": "true"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 5)

    def test_list_includes_owner_display_name(self):
        """Each post includes the owning user's display_name."""
        res = self.client.get(POSTS_URL)

        post = next(p for p in res.data if p["id"] == 1)
        self.assertEqual(post["owner_display_name"], "Jane D.")

    def test_list_includes_comment_count(self):
        """Each post includes a comment_count field defaulting to 0."""
        res = self.client.get(POSTS_URL)

        post = next(p for p in res.data if p["id"] == 1)
        self.assertIn("comment_count", post)
        self.assertEqual(post["comment_count"], 0)

    def test_list_includes_first_photo_url_as_none_when_no_photos(self):
        """first_photo_url is None for posts with no attached photos."""
        res = self.client.get(POSTS_URL)

        post = next(p for p in res.data if p["id"] == 1)
        self.assertIsNone(post["first_photo_url"])

    def test_list_requires_authentication(self):
        """Unauthenticated requests to the post list return 401."""
        self.client.force_authenticate(user=None)
        res = self.client.get(POSTS_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
