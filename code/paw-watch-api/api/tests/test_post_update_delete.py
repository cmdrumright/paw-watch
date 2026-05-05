from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Post

User = get_user_model()


class PostUpdateTests(APITestCase):
    """Tests for PATCH /api/posts/<id>."""

    fixtures = ["users", "posts"]

    def setUp(self):
        self.owner = User.objects.get(email="jane@example.com")
        self.other = User.objects.get(email="tom@example.com")
        self.client.force_authenticate(user=self.owner)

    def test_patch_returns_200(self):
        """Owner can update a post and receives 200 with the updated detail."""
        res = self.client.patch("/api/posts/1", {"pet_name": "Maxwell"}, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["pet_name"], "Maxwell")

    def test_patch_persists_changes(self):
        """Updated fields are saved to the database."""
        self.client.patch("/api/posts/1", {"status": "reunited"}, format="multipart")

        post = Post.objects.get(pk=1)
        self.assertEqual(post.status, Post.Status.REUNITED)

    def test_patch_only_updates_provided_fields(self):
        """Fields not included in the payload are left unchanged."""
        original_name = Post.objects.get(pk=1).pet_name
        self.client.patch("/api/posts/1", {"color": "golden"}, format="multipart")

        post = Post.objects.get(pk=1)
        self.assertEqual(post.pet_name, original_name)
        self.assertEqual(post.color, "golden")

    def test_patch_by_non_owner_returns_403(self):
        """A user who does not own the post receives 403."""
        self.client.force_authenticate(user=self.other)
        res = self.client.patch("/api/posts/1", {"pet_name": "Hacked"}, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_unknown_id_returns_404(self):
        """Patching a post ID that does not exist returns 404."""
        res = self.client.patch("/api/posts/9999", {"pet_name": "Ghost"}, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_requires_authentication(self):
        """Unauthenticated patch requests return 401."""
        self.client.force_authenticate(user=None)
        res = self.client.patch("/api/posts/1", {"pet_name": "X"}, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PostDeleteTests(APITestCase):
    """Tests for DELETE /api/posts/<id>."""

    fixtures = ["users", "posts"]

    def setUp(self):
        self.owner = User.objects.get(email="jane@example.com")
        self.other = User.objects.get(email="tom@example.com")
        self.admin = User.objects.get(email="admin@example.com")
        self.client.force_authenticate(user=self.owner)

    def test_delete_by_owner_returns_204(self):
        """Owner can delete their own post and receives 204."""
        res = self.client.delete("/api/posts/1")

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_removes_post_from_database(self):
        """The post no longer exists after deletion."""
        self.client.delete("/api/posts/1")

        self.assertFalse(Post.objects.filter(pk=1).exists())

    def test_delete_by_admin_returns_204(self):
        """An admin can delete any post regardless of ownership."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete("/api/posts/1")

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_by_non_owner_returns_403(self):
        """A non-owner non-admin receives 403."""
        self.client.force_authenticate(user=self.other)
        res = self.client.delete("/api/posts/1")

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_unknown_id_returns_404(self):
        """Deleting a post ID that does not exist returns 404."""
        res = self.client.delete("/api/posts/9999")

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_requires_authentication(self):
        """Unauthenticated delete requests return 401."""
        self.client.force_authenticate(user=None)
        res = self.client.delete("/api/posts/1")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
