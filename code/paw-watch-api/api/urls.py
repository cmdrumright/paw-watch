from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import PostViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"posts", PostViewSet, basename="post")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/", include("api.auth_urls")),
]
