from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
    ]

    EXPERIENCE_LEVEL_CHOICES = [
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead'),
        ('manager', 'Manager'),
    ]

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, null=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='mid')
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    responsibilities = models.TextField(blank=True, null=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(blank=True, null=True)
    skills_required = models.TextField(blank=True, null=True, help_text="Comma-separated list of skills")

    def __str__(self):
        return f"{self.title} at {self.company}"

    @property
    def is_expired(self):
        if self.deadline:
            return timezone.now().date() > self.deadline
        return False

    class Meta:
        ordering = ['-created_at']

class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewed', 'Reviewed'),
        ('interview', 'Interview'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    cover_letter = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True, help_text="Internal notes about the application")

    class Meta:
        unique_together = ('job', 'applicant')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.applicant.email} - {self.job.title}"

class SavedJob(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by_users')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"
