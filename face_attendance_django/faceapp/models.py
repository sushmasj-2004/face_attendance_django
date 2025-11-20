# faceapp/models.py
from django.db import models

class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_employees = models.IntegerField(default=0)



class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True)
    photo = models.ImageField(upload_to='photos/')
    embedding = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_admin=models.BooleanField(default=False)

class Attendance(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance')
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)