from django.db import models
from .post import Post
from .photo import Photo


class PostPhoto(models.Model):
    """Join table linking a Photo to a Post, ordered by the photo's display order."""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post_photos")
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE, related_name="post_photos")

    class Meta:
        ordering = ["photo__order"]
