from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('user', 'User'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_manager(self):
        return self.role == 'manager'
    
    def is_user(self):
        return self.role == 'user'
    
    def can_manage_users(self):
        return self.role in ['admin', 'manager']
    
    def can_manage_posts(self):
        return self.role in ['admin', 'manager']
    
    def can_create_posts(self):
        return self.role in ['admin', 'manager', 'user']
    
    class Meta:
        db_table = 'auth_user'
