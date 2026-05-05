from django.conf import settings
from django.db import models


class Post(models.Model):
    """A lost or found pet listing created by a registered community member."""

    class Type(models.TextChoices):
        """Whether the post is reporting a lost pet or a found pet."""

        LOST = "lost", "Lost"
        FOUND = "found", "Found"

    class Status(models.TextChoices):
        """Lifecycle status of a post from active through resolution."""

        ACTIVE = "active", "Active"
        SIGHTING_REPORTED = "sighting_reported", "Sighting Reported"
        REUNITED = "reunited", "Reunited"
        CLOSED = "closed", "Closed"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    type = models.CharField(max_length=5, choices=Type.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )
    pet_name = models.CharField(max_length=100)
    species = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=100)
    description = models.TextField()
    incident_date = models.DateField()
    location_lat = models.FloatField()
    location_lng = models.FloatField()
    location_label = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
