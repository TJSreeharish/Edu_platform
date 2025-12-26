from django.urls import path
from . import views
urlpatterns = [
    path('',views.index),
    path('video_transcribe/',views.video_transcribe),
    path('stt/',views.stt),
]