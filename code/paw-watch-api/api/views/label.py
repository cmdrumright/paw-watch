from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from api.models import Label


class LabelSerializer(serializers.ModelSerializer):
    """Serializer for a single label."""

    class Meta:
        model = Label
        fields = ["id", "name"]


class LabelViewSet(ViewSet):
    """Handles listing and managing labels."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Return all labels ordered by name. Available to any authenticated user."""
        labels = Label.objects.all()
        return Response(LabelSerializer(labels, many=True).data)

    def create(self, request):
        """Create a new label. Admin only."""
        if request.user.role != request.user.Role.ADMIN:
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        serializer = LabelSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        label = serializer.save()
        return Response(LabelSerializer(label).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """Rename a label. Admin only."""
        if request.user.role != request.user.Role.ADMIN:
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            label = Label.objects.get(pk=pk)
        except Label.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = LabelSerializer(label, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        label = serializer.save()
        return Response(LabelSerializer(label).data)

    def destroy(self, request, pk=None):
        """Delete a label and cascade-remove all PostLabel rows. Admin only."""
        if request.user.role != request.user.Role.ADMIN:
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            label = Label.objects.get(pk=pk)
        except Label.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        label.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
