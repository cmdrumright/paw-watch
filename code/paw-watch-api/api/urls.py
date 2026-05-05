from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import PostViewSet, LabelViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"posts", PostViewSet, basename="post")
router.register(r"labels", LabelViewSet, basename="label")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/", include("api.auth_urls")),
]
