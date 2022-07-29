
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("post", views.write_post, name="write_post"),
    path("posts/<str:option>", views.load_posts, name="posts"),
    path("post/<int:post_id>/<str:option>", views.update_post, name="post"),
    path("profile/<int:get_user_id>/<str:option>", views.load_profile, name=" load_profile"),
]
