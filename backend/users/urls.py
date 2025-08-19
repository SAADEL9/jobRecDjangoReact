from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Auth check
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),
]
