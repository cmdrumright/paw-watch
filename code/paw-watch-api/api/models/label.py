from django.db import models


class Label(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PostLabel(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="post_labels")
    label = models.ForeignKey(Label, on_delete=models.CASCADE, related_name="post_labels")

    class Meta:
        unique_together = [["post", "label"]]
