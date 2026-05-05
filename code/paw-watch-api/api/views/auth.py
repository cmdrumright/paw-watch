from django.contrib.auth import get_user_model, authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

User = get_user_model()


def _token_pair(user):
    """Return a dict with a fresh access and refresh JWT token for the given user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "display_name": user.display_name,
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Create a new user account and return a JWT token pair.

    Expects: email, password, display_name.
    Returns 400 if any field is missing or the email is already registered.
    Returns 201 with {access, refresh} on success.
    """
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    display_name = request.data.get("display_name", "").strip()

    if not email or not password or not display_name:
        return Response(
            {"detail": "email, password, and display_name are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"detail": "An account with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        display_name=display_name,
    )

    return Response(_token_pair(user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Authenticate a user by email and password and return a JWT token pair.

    Expects: email, password.
    Returns 400 if either field is missing.
    Returns 401 if credentials are invalid.
    Returns 200 with {access, refresh} on success.
    """
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {"detail": "email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response(_token_pair(user), status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh(request):
    """Exchange a valid refresh token for a new access token.

    Expects: refresh.
    Returns 400 if the token is missing.
    Returns 401 if the token is invalid or expired.
    Returns 200 with {access} on success.
    """
    token = request.data.get("refresh", "")
    if not token:
        return Response(
            {"detail": "refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        refresh_token = RefreshToken(token)
        return Response(
            {"access": str(refresh_token.access_token)},
            status=status.HTTP_200_OK,
        )
    except TokenError:
        return Response(
            {"detail": "Invalid or expired refresh token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Blacklist the provided refresh token, ending the user's session.

    Expects: refresh. Requires a valid access token in the Authorization header.
    Returns 400 if the token is missing or already invalid.
    Returns 204 on success.
    """
    token = request.data.get("refresh", "")
    if not token:
        return Response(
            {"detail": "refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        RefreshToken(token).blacklist()
    except TokenError:
        return Response(
            {"detail": "Invalid or expired refresh token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(status=status.HTTP_204_NO_CONTENT)
