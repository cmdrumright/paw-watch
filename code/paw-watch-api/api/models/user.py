from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model extending AbstractUser with display name, avatar, and role."""

    class Role(models.TextChoices):
        """Valid roles a user account can hold."""

        MEMBER = "member", "Member"
        SHELTER = "shelter", "Shelter"
        ADMIN = "admin", "Admin"

    display_name = models.CharField(max_length=50, blank=True)
    avatar_url = models.URLField(blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
