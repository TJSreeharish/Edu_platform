from django.urls import path
from . import views
urlpatterns = [
    path('latex/',views.img_to_latex),
]