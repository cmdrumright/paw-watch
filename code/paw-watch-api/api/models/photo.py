from django.db import models


class Photo(models.Model):
    """A single uploaded image file, shared by both Post and Comment via join tables."""

    file_path = models.ImageField(upload_to="photos/")
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]
