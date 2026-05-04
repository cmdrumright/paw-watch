from django.urls import path
from api.views import register, login, refresh, logout

urlpatterns = [
    path("register/", register, name="auth-register"),
    path("login/", login, name="auth-login"),
    path("refresh/", refresh, name="auth-refresh"),
    path("logout/", logout, name="auth-logout"),
]
