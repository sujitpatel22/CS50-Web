from django.contrib import admin
from auctions.models import *

# Register your models here.
admin.site.register(User)
admin.site.register(listings)
admin.site.register(watchlist)
admin.site.register(all_comments)