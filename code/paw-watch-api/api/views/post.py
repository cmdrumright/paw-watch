from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from api.models import Post


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for the post list endpoint — lightweight fields only."""

    owner_display_name = serializers.CharField(source="owner.display_name", read_only=True)
    first_photo_url = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "type",
            "status",
            "pet_name",
            "species",
            "breed",
            "color",
            "location_label",
            "incident_date",
            "created_at",
            "owner_display_name",
            "first_photo_url",
            "comment_count",
        ]

    def get_first_photo_url(self, obj):
        """Return the absolute URL of the first photo attached to this post, or None."""
        first = obj.post_photos.select_related("photo").first()
        if not first:
            return None
        request = self.context.get("request")
        url = first.photo.file_path.url
        return request.build_absolute_uri(url) if request else url

    def get_comment_count(self, obj):
        """Return the number of comments on this post."""
        try:
            return obj.comments.count()
        except AttributeError:
            return 0


class PostViewSet(ViewSet):
    """Handles listing pet posts."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Return all posts, excluding reunited and closed by default.

        Query params:
            include_closed (bool): pass `true` to include reunited and closed posts.
        """
        include_closed = request.query_params.get("include_closed", "false").lower() == "true"

        qs = Post.objects.select_related("owner").prefetch_related("post_photos__photo")
        if not include_closed:
            qs = qs.exclude(status__in=[Post.Status.REUNITED, Post.Status.CLOSED])

        serializer = PostListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)
