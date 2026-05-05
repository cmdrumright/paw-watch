from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import PostViewSet, LabelViewSet, CommentViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"posts", PostViewSet, basename="post")
router.register(r"labels", LabelViewSet, basename="label")

comment_list = CommentViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = [
    path("", include(router.urls)),
    path("auth/", include("api.auth_urls")),
    path("posts/<int:post_pk>/comments", comment_list, name="post-comments"),
]
