from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.me_view, name='me'),
    path('csrf/', views.csrf_token_view, name='csrf'),
    
    # Profile management
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # Jeweler specific
    path('jeweler/profile/', views.JewelerProfileView.as_view(), name='jeweler_profile'),
]
