
from django.db import models
import uuid
from django.utils import timezone

class Transcript(models.Model):
    transcript_id = models.CharField(max_length=100, unique=True, primary_key=True, default=uuid.uuid4)
    transcript_text = models.TextField()
    source_lan = models.TextField(default= "en")
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return f"Transcript {self.transcript_id}"
    
    class Meta:
        db_table = 'transcripts'
        get_latest_by = 'created_at'