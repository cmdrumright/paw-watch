from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

REGISTER_URL = "/api/auth/register/"


class RegisterTests(APITestCase):
    def test_register_creates_user(self):
        res = self.client.post(REGISTER_URL, {
            "email": "jane@example.com",
            "password": "securepass123",
            "display_name": "Jane",
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="jane@example.com").exists())

    def test_register_returns_jwt_tokens(self):
        res = self.client.post(REGISTER_URL, {
            "email": "jane@example.com",
            "password": "securepass123",
            "display_name": "Jane",
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertTrue(len(res.data["access"]) > 0)
        self.assertTrue(len(res.data["refresh"]) > 0)

    def test_register_duplicate_email_returns_400(self):
        User.objects.create_user(
            username="jane@example.com",
            email="jane@example.com",
            password="securepass123",
        )

        res = self.client.post(REGISTER_URL, {
            "email": "jane@example.com",
            "password": "anotherpass",
            "display_name": "Jane 2",
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.filter(email="jane@example.com").count(), 1)

    def test_register_missing_fields_returns_400(self):
        res = self.client.post(REGISTER_URL, {
            "email": "jane@example.com",
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="jane@example.com").exists())
