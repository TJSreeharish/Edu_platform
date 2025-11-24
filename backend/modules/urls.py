from django.urls import path
from . import views
urlpatterns = [
    path('',views.index),
    path('video_transcribe/',views.extract_audio),
]