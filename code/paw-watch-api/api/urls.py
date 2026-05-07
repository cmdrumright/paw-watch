from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import PostViewSet, LabelViewSet, CommentViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"posts", PostViewSet, basename="post")
router.register(r"labels", LabelViewSet, basename="label")

comment_list = CommentViewSet.as_view({"get": "list", "post": "create"})
comment_detail = CommentViewSet.as_view({"delete": "destroy"})
comment_confirm = CommentViewSet.as_view({"patch": "confirm_sighting"})
post_status = PostViewSet.as_view({"patch": "set_status"})

urlpatterns = [
    path("", include(router.urls)),
    path("auth/", include("api.auth_urls")),
    path("posts/<int:post_pk>/comments", comment_list, name="post-comments"),
    path("comments/<int:pk>", comment_detail, name="comment-detail"),
    path("comments/<int:pk>/confirm", comment_confirm, name="comment-confirm"),
    path("posts/<int:pk>/status", post_status, name="post-status"),
]
