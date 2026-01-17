from django.urls import path
from .views import nllb, document_translate

urlpatterns = [
    path("nllb/", nllb),
    path("document/", document_translate),
]
