# from pyexpat import model
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.username}"


class all_comments(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    text = models.TextField(max_length=150, null=True, blank=True)

    def __str__(self):
        return f"{self.user}: {self.text}"


class listings(models.Model):
    name = models.CharField(max_length=50)
    img = models.URLField(blank=True)
    description = models.CharField(max_length=150)
    category = models.CharField(max_length=50)
    bid = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    active = models.BooleanField(default=True)
    owner = models.ForeignKey(
        'User', on_delete=models.CASCADE, related_name="get_listings", null=True)
    winner = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    # user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    saved = models.BooleanField(default=False)
    date = models.DateField(null=True, blank=True)
    bids_count = models.IntegerField(null=True, blank=True)
    comments = models.ManyToManyField(
        all_comments, related_name="commented", null=True, blank=True)


class bids(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    bid = models.DecimalField(max_digits=15, decimal_places=2)
    listing = models.ForeignKey(listings, on_delete=models.CASCADE, null=True)

    def __Str__(self):
        return f"{self.listing.name} on {self.bid} by {self.user}"

class my_listings(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    bided = models.ForeignKey(listings, on_delete=models.CASCADE, null=True)


class watchlist(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    list = models.ManyToManyField(listings, related_name="my_watchlist", null=True, blank=True)
