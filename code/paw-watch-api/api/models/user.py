from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        MEMBER = "member", "Member"
        SHELTER = "shelter", "Shelter"
        ADMIN = "admin", "Admin"

    display_name = models.CharField(max_length=50, blank=True)
    avatar_url = models.URLField(blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
