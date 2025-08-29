from django.urls import path
from . import views

urlpatterns = [
    # Job endpoints
    path('', views.JobListCreateView.as_view(), name='job-list'),
    path('recommendations/', views.JobRecommendationView.as_view(), name='job-recommendations'),
    path('<int:pk>/', views.JobRetrieveUpdateDestroyView.as_view(), name='job-detail'),
    
    # Application endpoints
    path('applications/', views.ApplicationListCreateView.as_view(), name='application-list'),
    path('applications/<int:pk>/', views.ApplicationRetrieveUpdateView.as_view(), name='application-detail'),
    
    # Saved jobs endpoints
    path('saved/', views.SavedJobListCreateView.as_view(), name='saved-job-list'),
    path('saved/<int:job_id>/', views.SavedJobDestroyView.as_view(), name='saved-job-detail'),
]
