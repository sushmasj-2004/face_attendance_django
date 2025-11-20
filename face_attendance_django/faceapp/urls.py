from django.urls import path
from . import views

urlpatterns = [
    path('api/departments/', views.get_departments, name='get_departments'),
    path('api/departments/add/', views.add_department, name='add_department'),
    path('api/register/', views.register_user, name='register_user'),
    path('api/start/', views.start_attendance, name='start_attendance'),
    path('api/delete/<str:email>/', views.delete_user, name='delete_user'),
    path('api/verify-face/', views.verify_face, name='verify_face'),
]
