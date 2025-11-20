from deepface import DeepFace

result = DeepFace.find(
    img_path="C:/Users/sushm/face_attendance_django/face_attendance_django/known_faces/sushma.jpg",
    db_path="C:/Users/sushm/face_attendance_django/face_attendance_django/known_faces"
)

print(result)
