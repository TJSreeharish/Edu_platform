from django.urls import path
from .views import add_equation, list_equations

urlpatterns = [
    path("add/", add_equation),
    path("list/", list_equations),
]
