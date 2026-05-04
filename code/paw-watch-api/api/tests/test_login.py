from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

LOGIN_URL = "/api/auth/login/"
REFRESH_URL = "/api/auth/refresh/"
LOGOUT_URL = "/api/auth/logout/"


def create_user(email="jane@example.com", password="securepass123", display_name="Jane"):
    return User.objects.create_user(username=email, email=email, password=password, display_name=display_name)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = create_user()

    def test_login_returns_tokens(self):
        """Valid credentials return a 200 with both access and refresh tokens."""
        res = self.client.post(LOGIN_URL, {"email": "jane@example.com", "password": "securepass123"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_login_bad_password_returns_401(self):
        """A correct email with the wrong password returns 401."""
        res = self.client.post(LOGIN_URL, {"email": "jane@example.com", "password": "wrongpass"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unknown_email_returns_401(self):
        """An email that does not exist in the database returns 401."""
        res = self.client.post(LOGIN_URL, {"email": "nobody@example.com", "password": "securepass123"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields_returns_400(self):
        """A login request missing the password field returns 400."""
        res = self.client.post(LOGIN_URL, {"email": "jane@example.com"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class RefreshTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        res = self.client.post(LOGIN_URL, {"email": "jane@example.com", "password": "securepass123"}, format="json")
        self.refresh_token = res.data["refresh"]

    def test_refresh_returns_new_access_token(self):
        """A valid refresh token returns a new access token without issuing a new refresh token."""
        res = self.client.post(REFRESH_URL, {"refresh": self.refresh_token}, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertNotIn("refresh", res.data)

    def test_refresh_invalid_token_returns_401(self):
        """A malformed or invalid refresh token returns 401."""
        res = self.client.post(REFRESH_URL, {"refresh": "notavalidtoken"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_missing_token_returns_400(self):
        """A refresh request with no token field returns 400."""
        res = self.client.post(REFRESH_URL, {}, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        res = self.client.post(LOGIN_URL, {"email": "jane@example.com", "password": "securepass123"}, format="json")
        self.access_token = res.data["access"]
        self.refresh_token = res.data["refresh"]

    def test_logout_blacklists_refresh_token(self):
        """Logging out blacklists the refresh token so it can no longer be used to obtain a new access token."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        res = self.client.post(LOGOUT_URL, {"refresh": self.refresh_token}, format="json")

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        # blacklisted token can no longer be used to refresh
        res = self.client.post(REFRESH_URL, {"refresh": self.refresh_token}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_authentication(self):
        """Logout without a valid access token in the Authorization header returns 401."""
        res = self.client.post(LOGOUT_URL, {"refresh": self.refresh_token}, format="json")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
