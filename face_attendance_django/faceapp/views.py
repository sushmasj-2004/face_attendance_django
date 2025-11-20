# faceapp/views.py
import json, io, base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from PIL import Image
import numpy as np
from .models import User, Attendance, Department
from .utils import add_attendance_to_csv
import os
from django.conf import settings

try:
    from deepface import DeepFace
    HAS_DEEPFACE = True
except Exception:
    HAS_DEEPFACE = False


def recognize_face_from_frame(frame):
    """
    Safe recognition: Returns (User instance or None, distance float or None)
    """
    if not HAS_DEEPFACE:
        print("DeepFace not installed.")
        return None, None

    try:
        rep = DeepFace.represent(frame, model_name='Facenet', enforce_detection=False)
        if not rep or 'embedding' not in rep[0]:
            return None, None

        current_emb = np.array(rep[0]['embedding'])

        best_user = None
        min_dist = float('inf')
        for u in User.objects.exclude(embedding=None):
            try:
                stored = np.array(json.loads(u.embedding))
                dist = np.linalg.norm(stored - current_emb)
                if dist < min_dist:
                    min_dist = dist
                    best_user = u
            except Exception as e:
                print(f"Skipping user {u.email} due to error: {e}")
                continue

        return best_user, min_dist
    except Exception as e:
        print("Error in DeepFace represent:", e)
        return None, None


@csrf_exempt
def start_attendance(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

    if not HAS_DEEPFACE:
        return JsonResponse({"status": "error", "message": "DeepFace not installed"}, status=501)

    try:
        payload = json.loads(request.body.decode('utf-8'))
        print("Payload received:", payload.keys())

        image_data = payload.get('image')
        if not image_data:
            return JsonResponse({"status": "error", "message": "No image provided"}, status=400)

        # Remove base64 header if present
        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]

        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            return JsonResponse({"status": "error", "message": "Invalid base64 image", "error": str(e)}, status=400)

        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        frame = np.array(img)[:, :, ::-1]  # RGB -> BGR

        # Check if frame is empty
        if frame.size == 0:
            return JsonResponse({"status": "error", "message": "Captured image is empty"}, status=400)

        # Recognize face
        user, distance = recognize_face_from_frame(frame)
        print(f"Recognition result: user={user}, distance={distance}")

        if user and distance is not None and distance < 15.0:
            today = timezone.now().date()
            if Attendance.objects.filter(employee=user, timestamp__date=today).exists():
                return JsonResponse({"status": "exists", "message": f"Attendance already marked for {user.name}"})

            att = Attendance.objects.create(employee=user, status='Present')
            add_attendance_to_csv(user, att.timestamp)

            return JsonResponse({
                "status": "success",
                "message": f"Attendance marked for {user.name}",
                "name": user.name,
                "email": user.email,
                "distance": distance
            })
        else:
            return JsonResponse({"status": "failed", "message": "Face not recognised"})

    except Exception as e:
        print("Error in start_attendance:", str(e))
        return JsonResponse({"status": "error", "message": "Server error", "error": str(e)}, status=500)

@csrf_exempt
def add_department(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        name = data.get("name")
        location = data.get("location", "")
        if not name:
            return JsonResponse({"error": "Name required"}, status=400)
        dept = Department.objects.create(department_name=name, location=location)
        return JsonResponse({"message": "Department created", "department_id": dept.department_id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_departments(request):
    qs = Department.objects.all().values("department_id", "department_name", "location", "total_employees")
    return JsonResponse(list(qs), safe=False)

@csrf_exempt
def delete_user(request, email):
    if request.method not in ['DELETE', 'POST']:
        return JsonResponse({"error": "Use DELETE or POST"}, status=405)
    try:
        u = User.objects.get(email=email)
        dept = u.department
        u.delete()
        if dept:
            dept.total_employees = User.objects.filter(department=dept).count()
            dept.save()
        return JsonResponse({"message": "User deleted"})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    
    
# ---------------------------
# Verify face for a user
# ---------------------------
@csrf_exempt
def verify_face(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)
    if not HAS_DEEPFACE:
        return JsonResponse({"error": "DeepFace not installed"}, status=501)
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data.get("email")
        image_data = data.get("image")
        if not email or not image_data:
            return JsonResponse({"error": "email and image required"}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        if not user.embedding:
            return JsonResponse({"error": "User has no embedding saved"}, status=400)

        # Decode image
        if ',' in image_data:
            image_data = image_data.split(",", 1)[1]
        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        frame = np.array(img)[:, :, ::-1]

        rep = DeepFace.represent(frame, model_name="Facenet", enforce_detection=False)
        if not rep or "embedding" not in rep[0]:
            return JsonResponse({"error": "Face not detected"}, status=400)

        uploaded_emb = np.array(rep[0]["embedding"])
        stored_emb = np.array(json.loads(user.embedding))
        distance = np.linalg.norm(stored_emb - uploaded_emb)
        match = distance < 10.0

        return JsonResponse({"match": match, "distance": float(distance), "message": "Face matched" if match else "Face does not match"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    
@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=400)
    try:
        name = request.POST.get('name')
        email = request.POST.get('email')
        dept_id = request.POST.get('department')
        photo = request.FILES.get('photo')

        if not all([name, email, photo]):
            return JsonResponse({"error": "Name, email, and photo required"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "User with this email already exists"}, status=400)

        department = None
        if dept_id:
            try:
                department = Department.objects.get(department_id=dept_id)
            except Department.DoesNotExist:
                return JsonResponse({"error": "Invalid department id"}, status=400)

        user = User.objects.create(name=name, email=email, department=department, photo=photo)

        # Generate embedding if DeepFace available
        if HAS_DEEPFACE:
            try:
                img_path = os.path.join(settings.MEDIA_ROOT, str(user.photo))
                rep = DeepFace.represent(img_path=img_path, model_name='Facenet', enforce_detection=False)
                if rep and 'embedding' in rep[0]:
                    user.embedding = json.dumps(rep[0]['embedding'])
                    user.save()
            except Exception as e:
                return JsonResponse({"message": "User created but embedding failed", "warning": str(e)}, status=201)

        # Update total employees count
        if department:
            department.total_employees = User.objects.filter(department=department).count()
            department.save()

        return JsonResponse({"message": "User registered successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
def get_departments(request):
    departments = Department.objects.all().values("department_id", "department_name")
    return JsonResponse(list(departments), safe=False)