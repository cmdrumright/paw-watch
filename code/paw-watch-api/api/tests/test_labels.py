from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from api.models import Label, PostLabel

User = get_user_model()


class LabelListTests(APITestCase):
    """Tests for GET /api/labels."""

    fixtures = ["users", "labels"]

    def setUp(self):
        self.user = User.objects.get(email="jane@example.com")
        self.client.force_authenticate(user=self.user)

    def test_list_returns_200(self):
        """Authenticated user can retrieve all labels."""
        res = self.client.get("/api/labels")

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_list_returns_all_17_labels(self):
        """All 17 seeded labels are returned."""
        res = self.client.get("/api/labels")

        self.assertEqual(len(res.data), 17)

    def test_list_label_shape(self):
        """Each label has id and name fields."""
        res = self.client.get("/api/labels")

        self.assertIn("id", res.data[0])
        self.assertIn("name", res.data[0])

    def test_list_requires_authentication(self):
        """Unauthenticated requests return 401."""
        self.client.force_authenticate(user=None)
        res = self.client.get("/api/labels")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class LabelCreateTests(APITestCase):
    """Tests for POST /api/labels."""

    fixtures = ["users", "labels"]

    def setUp(self):
        self.admin = User.objects.get(email="admin@example.com")
        self.member = User.objects.get(email="jane@example.com")

    def test_admin_can_create_label(self):
        """Admin can create a new label and receives 201."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.post("/api/labels", {"name": "Stray"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["name"], "Stray")

    def test_create_persists_label(self):
        """New label is saved to the database."""
        self.client.force_authenticate(user=self.admin)
        self.client.post("/api/labels", {"name": "Stray"}, format="json")

        self.assertTrue(Label.objects.filter(name="Stray").exists())

    def test_member_cannot_create_label(self):
        """Non-admin receives 403."""
        self.client.force_authenticate(user=self.member)
        res = self.client.post("/api/labels", {"name": "Stray"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_name_returns_400(self):
        """Creating a label with an existing name returns 400."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.post("/api/labels", {"name": "Friendly"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LabelUpdateTests(APITestCase):
    """Tests for PATCH /api/labels/<id>."""

    fixtures = ["users", "labels"]

    def setUp(self):
        self.admin = User.objects.get(email="admin@example.com")
        self.member = User.objects.get(email="jane@example.com")

    def test_admin_can_rename_label(self):
        """Admin can rename a label and receives 200 with the updated name."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch("/api/labels/1", {"name": "Visually Impaired"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Visually Impaired")

    def test_member_cannot_rename_label(self):
        """Non-admin receives 403."""
        self.client.force_authenticate(user=self.member)
        res = self.client.patch("/api/labels/1", {"name": "X"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_rename_unknown_id_returns_404(self):
        """Patching a label that does not exist returns 404."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch("/api/labels/9999", {"name": "X"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class LabelDeleteTests(APITestCase):
    """Tests for DELETE /api/labels/<id>."""

    fixtures = ["users", "posts", "labels"]

    def setUp(self):
        self.admin = User.objects.get(email="admin@example.com")
        self.member = User.objects.get(email="jane@example.com")

    def test_admin_can_delete_label(self):
        """Admin can delete a label and receives 204."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete("/api/labels/1")

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_removes_label(self):
        """Deleted label no longer exists in the database."""
        self.client.force_authenticate(user=self.admin)
        self.client.delete("/api/labels/1")

        self.assertFalse(Label.objects.filter(pk=1).exists())

    def test_delete_cascades_post_labels(self):
        """Deleting a label removes its PostLabel rows."""
        PostLabel.objects.create(post_id=1, label_id=1)
        self.client.force_authenticate(user=self.admin)
        self.client.delete("/api/labels/1")

        self.assertFalse(PostLabel.objects.filter(label_id=1).exists())

    def test_member_cannot_delete_label(self):
        """Non-admin receives 403."""
        self.client.force_authenticate(user=self.member)
        res = self.client.delete("/api/labels/1")

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_unknown_id_returns_404(self):
        """Deleting a label that does not exist returns 404."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete("/api/labels/9999")

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class PostLabelsIntegrationTests(APITestCase):
    """Tests for labels field on post create/detail/update."""

    fixtures = ["users", "posts", "labels"]

    def setUp(self):
        self.user = User.objects.get(email="jane@example.com")
        self.client.force_authenticate(user=self.user)

    def test_post_detail_includes_labels(self):
        """GET /api/posts/<id> includes a labels array."""
        res = self.client.get("/api/posts/1")

        self.assertIn("labels", res.data)
        self.assertIsInstance(res.data["labels"], list)

    def test_create_post_with_label_ids(self):
        """Creating a post with label_ids links those labels."""
        payload = {
            "type": "lost", "pet_name": "Rex", "species": "dog",
            "color": "black", "description": "Lost near park.",
            "incident_date": "2026-05-01", "location_lat": "36.5298",
            "location_lng": "-87.3595", "location_label": "Clarksville, TN",
            "label_ids": [1, 2],
        }
        res = self.client.post("/api/posts", payload, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        label_ids = [l["id"] for l in res.data["labels"]]
        self.assertIn(1, label_ids)
        self.assertIn(2, label_ids)

    def test_patch_post_replaces_labels(self):
        """Patching label_ids replaces all existing labels on the post."""
        PostLabel.objects.create(post_id=1, label_id=1)
        res = self.client.patch("/api/posts/1", {"label_ids": [3, 4]}, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        label_ids = [l["id"] for l in res.data["labels"]]
        self.assertEqual(sorted(label_ids), [3, 4])

    def test_patch_post_without_label_ids_leaves_labels_unchanged(self):
        """Patching without label_ids does not modify existing labels."""
        PostLabel.objects.create(post_id=1, label_id=1)
        self.client.patch("/api/posts/1", {"pet_name": "NewName"}, format="multipart")

        self.assertTrue(PostLabel.objects.filter(post_id=1, label_id=1).exists())

    def test_create_post_with_invalid_label_id_returns_400(self):
        """Submitting a label_id that does not exist returns 400."""
        payload = {
            "type": "lost", "pet_name": "Rex", "species": "dog",
            "color": "black", "description": "Lost near park.",
            "incident_date": "2026-05-01", "location_lat": "36.5298",
            "location_lng": "-87.3595", "location_label": "Clarksville, TN",
            "label_ids": [9999],
        }
        res = self.client.post("/api/posts", payload, format="multipart")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
