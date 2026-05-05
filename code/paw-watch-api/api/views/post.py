from rest_framework import serializers, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from api.models import Post, Photo, PostPhoto, Label, PostLabel
from api.views.label import LabelSerializer


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for the post list endpoint — lightweight fields only."""

    owner_display_name = serializers.CharField(source="owner.display_name", read_only=True)
    first_photo_url = serializers.SerializerMethodField()
    labels = serializers.SerializerMethodField()
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
            "location_lat",
            "location_lng",
            "incident_date",
            "created_at",
            "owner_display_name",
            "first_photo_url",
            "labels",
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

    def get_labels(self, obj):
        """Return all labels attached to this post."""
        labels = [pl.label for pl in obj.post_labels.select_related("label").all()]
        return LabelSerializer(labels, many=True).data

    def get_comment_count(self, obj):
        """Return the number of comments on this post."""
        try:
            return obj.comments.count()
        except AttributeError:
            return 0


class PhotoSerializer(serializers.ModelSerializer):
    """Serializer for a single photo, returning the absolute file URL."""

    url = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ["id", "url", "order"]

    def get_url(self, obj):
        """Return the absolute URL for the photo file."""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file_path.url) if request else obj.file_path.url


class OwnerSerializer(serializers.Serializer):
    """Serializer for the post owner, exposing public profile fields only."""

    id = serializers.IntegerField()
    display_name = serializers.CharField()
    avatar_url = serializers.URLField()


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer for the post detail endpoint — full fields including all photos and owner info."""

    owner = OwnerSerializer(read_only=True)
    photos = serializers.SerializerMethodField()
    labels = serializers.SerializerMethodField()
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
            "description",
            "incident_date",
            "location_lat",
            "location_lng",
            "location_label",
            "created_at",
            "updated_at",
            "owner",
            "photos",
            "labels",
            "comment_count",
        ]

    def get_photos(self, obj):
        """Return all photos attached to this post in display order."""
        photos = [pp.photo for pp in obj.post_photos.select_related("photo").all()]
        return PhotoSerializer(photos, many=True, context=self.context).data

    def get_labels(self, obj):
        """Return all labels attached to this post."""
        labels = [pl.label for pl in obj.post_labels.select_related("label").all()]
        return LabelSerializer(labels, many=True).data

    def get_comment_count(self, obj):
        """Return the number of comments on this post."""
        try:
            return obj.comments.count()
        except AttributeError:
            return 0


class PostCreateSerializer(serializers.Serializer):
    """Validates the multipart payload for creating a new post."""

    type = serializers.ChoiceField(choices=Post.Type.choices)
    pet_name = serializers.CharField(max_length=100)
    species = serializers.CharField(max_length=50)
    breed = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    color = serializers.CharField(max_length=100)
    description = serializers.CharField()
    incident_date = serializers.DateField()
    location_lat = serializers.FloatField()
    location_lng = serializers.FloatField()
    location_label = serializers.CharField(max_length=255)
    photos = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
    )
    label_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    def validate_photos(self, value):
        """Reject submissions with more than 4 photos."""
        if len(value) > 4:
            raise serializers.ValidationError("A post may have at most 4 photos.")
        return value

    def validate_label_ids(self, value):
        """Reject label IDs that do not exist."""
        existing = set(Label.objects.filter(pk__in=value).values_list("pk", flat=True))
        missing = set(value) - existing
        if missing:
            raise serializers.ValidationError(f"Label IDs not found: {sorted(missing)}")
        return value


class PostUpdateSerializer(serializers.Serializer):
    """Validates the multipart payload for partially updating a post. All fields optional."""

    type = serializers.ChoiceField(choices=Post.Type.choices, required=False)
    status = serializers.ChoiceField(choices=Post.Status.choices, required=False)
    pet_name = serializers.CharField(max_length=100, required=False)
    species = serializers.CharField(max_length=50, required=False)
    breed = serializers.CharField(max_length=100, required=False, allow_blank=True)
    color = serializers.CharField(max_length=100, required=False)
    description = serializers.CharField(required=False)
    incident_date = serializers.DateField(required=False)
    location_lat = serializers.FloatField(required=False)
    location_lng = serializers.FloatField(required=False)
    location_label = serializers.CharField(max_length=255, required=False)
    label_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    def validate_label_ids(self, value):
        """Reject label IDs that do not exist."""
        existing = set(Label.objects.filter(pk__in=value).values_list("pk", flat=True))
        missing = set(value) - existing
        if missing:
            raise serializers.ValidationError(f"Label IDs not found: {sorted(missing)}")
        return value


class PostViewSet(ViewSet):
    """Handles listing and retrieving pet posts."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request):
        """Create a new post with up to 4 photos.

        Accepts multipart/form-data. Images are saved to disk, Photo records are
        created, and each is linked to the new post via PostPhoto.
        Returns the full post detail on success (201).
        """
        data = request.data.copy()
        photos = request.FILES.getlist("photos")
        data.setlist("photos", photos)

        serializer = PostCreateSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        photo_files = validated.pop("photos", [])
        label_ids = validated.pop("label_ids", [])

        post = Post.objects.create(owner=request.user, **validated)

        for order, file in enumerate(photo_files):
            photo = Photo.objects.create(file_path=file, order=order)
            PostPhoto.objects.create(post=post, photo=photo)

        for label_id in label_ids:
            PostLabel.objects.create(post=post, label_id=label_id)

        post_with_related = Post.objects.select_related("owner").prefetch_related(
            "post_photos__photo", "post_labels__label"
        ).get(pk=post.pk)
        return Response(
            PostDetailSerializer(post_with_related, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def list(self, request):
        """Return all posts, excluding reunited and closed by default.

        Query params:
            include_closed (bool): pass `true` to include reunited and closed posts.
        """
        include_closed = request.query_params.get("include_closed", "false").lower() == "true"

        qs = Post.objects.select_related("owner").prefetch_related(
            "post_photos__photo", "post_labels__label"
        )
        if not include_closed:
            qs = qs.exclude(status__in=[Post.Status.REUNITED, Post.Status.CLOSED])

        serializer = PostListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        """Partially update a post. Owner only.

        Accepts multipart/form-data with any subset of post fields.
        Returns the updated post detail on success (200), or 403 if the
        requesting user is not the post owner.
        """
        try:
            post = Post.objects.select_related("owner").prefetch_related(
                "post_photos__photo"
            ).get(pk=pk)
        except Post.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if post.owner != request.user:
            return Response({"detail": "You do not have permission to edit this post."}, status=status.HTTP_403_FORBIDDEN)

        serializer = PostUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        label_ids = validated.pop("label_ids", None)

        for field, value in validated.items():
            setattr(post, field, value)
        post.save()

        if label_ids is not None:
            post.post_labels.all().delete()
            for label_id in label_ids:
                PostLabel.objects.create(post=post, label_id=label_id)

        post_with_related = Post.objects.select_related("owner").prefetch_related(
            "post_photos__photo", "post_labels__label"
        ).get(pk=post.pk)
        return Response(PostDetailSerializer(post_with_related, context={"request": request}).data)

    def destroy(self, request, pk=None):
        """Delete a post. Owner or admin only.

        Returns 204 on success, 403 if the requesting user is neither the post
        owner nor an admin.
        """
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        is_owner = post.owner == request.user
        is_admin = request.user.role == request.user.Role.ADMIN
        if not (is_owner or is_admin):
            return Response({"detail": "You do not have permission to delete this post."}, status=status.HTTP_403_FORBIDDEN)

        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, pk=None):
        """Return the full detail for a single post including all photos and owner info.

        Returns 404 if the post does not exist.
        """
        try:
            post = Post.objects.select_related("owner").prefetch_related(
                "post_photos__photo", "post_labels__label"
            ).get(pk=pk)
        except Post.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PostDetailSerializer(post, context={"request": request})
        return Response(serializer.data)
