from sqlite3 import connect
from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime

class User(AbstractUser):
    pass
    followers = models.ManyToManyField('self', related_name="get_followers", symmetrical=False)
    following = models.ManyToManyField('self', related_name="get_following", symmetrical=False)
    blocklist = models.ManyToManyField('self', symmetrical=True)


    def __str__(self):
        return f"{self.username}"

    def blocklist_format(self):
        return {
            "user_id": self.id,
            "username": self.username
        }


class Info(models.Model):
    user = models.ForeignKey('User', on_delete=models.PROTECT, null=True)
    poster = models.ForeignKey('User', related_name="get_poster", on_delete=models.PROTECT, null=True)
    connected = models.BooleanField(default=False, null=True)

    def info_format(self):
        return{
            "follow_id": self.id,
            "user": self.poster.id,
            "username": self.poster.username,
            "email": self.poster.email,
            "followers": self.poster.followers.count(),
            "following": self.poster.following.count(),
            "is_connected": self.connected,
            "user_loged": self.user.id
        }


class Block(models.Model):
    user = models. ForeignKey('User', on_delete = models.PROTECT, null=True)
    user2 = models.ForeignKey('User', related_name="get_user2", on_delete=models.PROTECT, null=True)
    blocked = models.BooleanField(default=False, null=True)

    def block_format(self):
        return {
            "user_id": self.user2.id,
            "username": self.user2.username
        }


class Post(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    content = models.TextField(max_length=250, null=True)
    likes = models.IntegerField(null=True, default=0)
    dislikes = models.IntegerField(null=True, default=0)
    date_time = models.DateTimeField(auto_now=True, null=True)
    editable = models.BooleanField(default=False, null=True)
    blocked = models.BooleanField(default=False, null=True)

    def format(self):
        return{
            "id": self.id,
            "user": self.user.id,
            "username": self.user.username,
            "content": self.content,
            "likes": self.likes,
            "dislikes": self.dislikes,
            "date_time": self.date_time.strftime("%b %d %Y, %I:%M %p"),
            "editable": self.editable,
            "blocked": self.blocked
        }


class Engage(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    post = models.ForeignKey('Post', on_delete=models.CASCADE, null=True)
    liked = models.BooleanField(default=False, null=True)
    disliked = models.BooleanField(default=False, null=True)
