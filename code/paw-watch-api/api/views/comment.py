from rest_framework import serializers, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from api.models import Comment, CommentPhoto, Photo, Post
from api.views.post import PhotoSerializer


class CommentAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    display_name = serializers.CharField()
    avatar_url = serializers.URLField()


class CommentSerializer(serializers.ModelSerializer):
    author = CommentAuthorSerializer(read_only=True)
    photos = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "body",
            "sighting_lat",
            "sighting_lng",
            "is_confirmed_sighting",
            "created_at",
            "photos",
        ]

    def get_photos(self, obj):
        photos = [cp.photo for cp in obj.comment_photos.select_related("photo").all()]
        return PhotoSerializer(photos, many=True, context=self.context).data


class CommentCreateSerializer(serializers.Serializer):
    body = serializers.CharField()
    sighting_lat = serializers.FloatField(required=False, allow_null=True)
    sighting_lng = serializers.FloatField(required=False, allow_null=True)


class CommentViewSet(ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request, post_pk=None):
        """Return all comments for a post, with author info and photos."""
        try:
            post = Post.objects.get(pk=post_pk)
        except Post.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        comments = (
            Comment.objects.filter(post=post)
            .select_related("author")
            .prefetch_related("comment_photos__photo")
        )
        return Response(CommentSerializer(comments, many=True, context={"request": request}).data)

    def create(self, request, post_pk=None):
        """Create a comment on a post, with up to 2 optional photo attachments."""
        try:
            post = Post.objects.get(pk=post_pk)
        except Post.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        photo_files = request.FILES.getlist("photos")
        if len(photo_files) > 2:
            return Response(
                {"photos": ["A comment may have at most 2 photos."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CommentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            body=validated["body"],
            sighting_lat=validated.get("sighting_lat"),
            sighting_lng=validated.get("sighting_lng"),
        )

        for order, file in enumerate(photo_files):
            photo = Photo.objects.create(file_path=file, order=order)
            CommentPhoto.objects.create(comment=comment, photo=photo)

        comment_with_related = (
            Comment.objects.select_related("author")
            .prefetch_related("comment_photos__photo")
            .get(pk=comment.pk)
        )
        return Response(
            CommentSerializer(comment_with_related, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
