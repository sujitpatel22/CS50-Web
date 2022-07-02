from linecache import getline
from urllib.robotparser import RequestRate
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from datetime import date
from django import forms
from .models import User
from auctions.models import *


# Global varaibles Initialisation:
close_permit=False


# Default index route:
@csrf_exempt
def index(request):
    return render(request, "auctions/index.html", {"listings": listings.objects.all()})



# Create a new listing:
@csrf_exempt
@login_required
def create_listing(request):
    if request.method == "POST":

        new_listing = listings(name=request.POST.get("name"), img=request.POST.get("img"), description=request.POST.get(
            "description"), category=request.POST.get("category"), bid=request.POST.get("starting_bid"),  owner=request.user, date=str(date.today()))
        new_listing.save()
        starting_bid=bids(user=request.user, bid=request.POST.get("starting_bid"), listing=new_listing)
        starting_bid.save()

        return HttpResponseRedirect(reverse("index"))

    else:
        return render(request, "auctions/create_listing.html")



# listing details and bid making/adding or removing from watchlist:
@csrf_exempt
def listing(request, listing_id):

    if request.method == "GET":

        get_listing = listings.objects.get(id=listing_id)
        get_comments = get_listing.comments.all()
        get_bid = bids.objects.get(listing=get_listing)

        if get_listing.owner == request.user:
            close_permit=True
        else:
            close_permit=False
        if (get_listing.winner == request.user and get_listing.active ==False):
            winner = get_listing.winner
            return render(request, "auctions/listing.html", {"listing": get_listing, "listing_bid":get_bid.bid, "comments": get_comments, "close_permit":close_permit, "winner": winner})
        else:
            return render(request, "auctions/listing.html", {"listing": get_listing, "listing_bid":get_bid.bid,  "close_permit":close_permit, "comments": get_comments})

    elif request.method == "POST":

        new_bid = int(request.POST.get("new_bid"))
        if new_bid:
            get_listing = listings.objects.get(id=listing_id)
            get_bid = bids.objects.get(listing=get_listing)
            if new_bid <= int(get_bid.bid):
                return HttpResponseRedirect(reverse("listing", args=(listing_id)))
            else:
                if get_listing.active == True:
                    get_bid.bid = new_bid
                    get_bid.save()
                    get_listing.winner = request.user
                    get_listing.save()
                    return HttpResponseRedirect(reverse("index"))
                else:
                    return HttpResponse("This listing is no longer active")
        else:
            return HttpResponse("Provide bid as input!")



# Closing the listing:
@csrf_exempt
@login_required
def close(request, listing_id):
    get_listing = listings.objects.get(id=listing_id)
    if (get_listing.owner == request.user):
        close_permit==True
        get_listing.active = False
        get_listing.save()
    return HttpResponseRedirect(reverse("index"))



# getting the categories page:
@csrf_exempt
def categories(request):
    return render(request, "auctions/categories.html")

# filtering and displaying the choosen category listings:
@csrf_exempt
def category(request, category):
    return render(request, "auctions/index.html", {"listings": listings.objects.filter(category=category)})



# getting current loged-in user's watchlist:
@csrf_exempt
@login_required
def get_watchlist(request):
    watch_list = watchlist.objects.get(user=request.user)
    return render(request, "auctions/watchlist.html", {"watchlist":watch_list.list.all()})

# adding/removing item from the watchlist:
@csrf_exempt
@login_required
def do_watchlist(request, listing_id):

    get_listing = listings.objects.get(id=listing_id)
    # watch_list = watchlist.objects.filter(user=request.user)

    if get_listing.saved == False:
        get_listing.saved = True
        get_listing.save()
        new_item = watchlist(user=request.user)
        new_item.save()
        new_item.list.add(get_listing)
        new_item.save()
        return HttpResponseRedirect(reverse("get_watchlist"))
    else:
        get_listing.saved = False
        get_listing.save()
        old_item = watchlist.objects.get(user=request.user, list=get_listing)
        old_item.delete()
        return HttpResponseRedirect(reverse("listing", args=[listing_id]))
        


# To post or view comments on a listing:
@csrf_exempt
def comments(request, listing_id):
    listing = listings.objects.get(id=listing_id)
    new_comment = all_comments(
        user=request.user, text=request.POST.get("comment_in"))
    new_comment.save()
    listing.comments.add(new_comment)
    listing.save()
    return HttpResponseRedirect(reverse("listing", args=[listing_id]))


# implimentation of authentication system:
# _______________________________________________________________________________________________________________

@csrf_exempt
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


@csrf_exempt
@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
