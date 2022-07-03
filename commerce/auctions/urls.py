from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_listing", views.create_listing, name="create_listing"),
    path("listing/<int:listing_id>", views.listing, name="listing"),
    path("get_watchlist", views.get_watchlist, name="get_watchlist"),
    path("do_watchlist/<int:listing_id>", views.do_watchlist, name="do_watchlist"),
    path("categories", views.categories, name="categories"),
    path("category/<str:category>", views.category, name="category"),
    path("comments/<int:listing_id>", views.comments, name="comments"),
    path("close/<int:listing_id>", views.close, name="close")
]