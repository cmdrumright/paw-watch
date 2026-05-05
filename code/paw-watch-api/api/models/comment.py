from django.db import models
from django.conf import settings


class Comment(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")
    body = models.TextField()
    sighting_lat = models.FloatField(null=True, blank=True)
    sighting_lng = models.FloatField(null=True, blank=True)
    is_confirmed_sighting = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class CommentPhoto(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="comment_photos")
    photo = models.ForeignKey("Photo", on_delete=models.CASCADE, related_name="comment_photos")

    class Meta:
        ordering = ["photo__order"]
