from rest_framework import generics, permissions, status, filters, serializers
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone
from .models import Job, Application, SavedJob
from .serializers import (
    JobSerializer, JobCreateUpdateSerializer,
    ApplicationSerializer, ApplicationUpdateSerializer,
    SavedJobSerializer
)
from jobs.pagination import StandardResultsSetPagination
from .recommendations import get_job_recommendations
from users.models import User



class JobListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'job_type': ['exact', 'in'],
        'experience_level': ['exact', 'in'],
        'company': ['exact', 'icontains'],
        'location': ['exact', 'icontains'],
        'is_active': ['exact'],
        'posted_by': ['exact'],
    }
    search_fields = ['title', 'company', 'description', 'requirements', 'skills_required']
    ordering_fields = ['created_at', 'updated_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Job.objects.all()
        
        # Filter out expired jobs unless explicitly requested
        show_expired = self.request.query_params.get('show_expired', '').lower() == 'true'
        if not show_expired:
            queryset = queryset.filter(
                Q(deadline__isnull=True) | Q(deadline__gte=timezone.now().date())
            )
        
        # Filter by applications for the current user
        my_applications = self.request.query_params.get('my_applications', '').lower() == 'true'
        if my_applications and self.request.user.is_authenticated:
            if hasattr(self.request.user, 'job_applications'):
                applied_job_ids = self.request.user.job_applications.values_list('job_id', flat=True)
                queryset = queryset.filter(id__in=applied_job_ids)
        
        # Filter by jobs posted by the current user
        my_posted_jobs = self.request.query_params.get('my_posted_jobs', '').lower() == 'true'
        if my_posted_jobs and self.request.user.is_authenticated:
            queryset = queryset.filter(posted_by=self.request.user)
        
        # Add applications count annotation
        queryset = queryset.annotate(applications_count=Count('applications'))
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return JobCreateUpdateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

class JobRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateUpdateSerializer
        return JobSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_update(self, serializer):
        if self.request.user != serializer.instance.posted_by:
            self.permission_denied(
                self.request,
                message="You do not have permission to update this job.",
                code=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        if self.request.user != instance.posted_by:
            self.permission_denied(
                self.request,
                message="You do not have permission to delete this job.",
                code=status.HTTP_403_FORBIDDEN
            )
        instance.delete()

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'job', 'applicant']
    ordering_fields = ['applied_at', 'updated_at']
    ordering = ['-applied_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.select_related('job', 'applicant').all()
        
        if hasattr(user, 'is_recruiter') and user.is_recruiter:
            return queryset.filter(job__posted_by=user)
        return queryset.filter(applicant=user)
    
    def perform_create(self, serializer):
        job = serializer.validated_data['job']
        if Application.objects.filter(job=job, applicant=self.request.user).exists():
            raise serializers.ValidationError({
                "job": ["You have already applied to this job."]
            })
        serializer.save(applicant=self.request.user)

class ApplicationRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Application.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ApplicationUpdateSerializer
        return ApplicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_recruiter:
            return Application.objects.filter(job__posted_by=user)
        return Application.objects.filter(applicant=user)

class SavedJobListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SavedJobDestroyView(generics.DestroyAPIView):
    queryset = SavedJob.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'job_id'
    
    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            self.permission_denied(
                self.request,
                message="You do not have permission to remove this saved job.",
                code=status.HTTP_403_FORBIDDEN
            )
        instance.delete()

from rest_framework import generics, permissions
from .models import Job
from .serializers import JobSerializer
from .recommendations import get_job_recommendations
from django.db.models import Case, When

class JobRecommendationView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # you can later enable it safely

    def get_queryset(self):
        user = self.request.user
        if user.is_candidate:
            recommended_jobs = get_job_recommendations(user)
            job_ids = [job.id for job in recommended_jobs]
            preserved_order = Case(*[When(id=pk, then=pos) for pos, pk in enumerate(job_ids)])
            return Job.objects.filter(id__in=job_ids).order_by(preserved_order)
        return Job.objects.none()
