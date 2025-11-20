import { useState, useEffect } from "react";
import axios from "axios";

export default function RegisterUser() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    photo: null,
  });
  const [message, setMessage] = useState("");

  // Fetch departments from backend
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/departments/")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Update form state
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department || !form.photo) {
      setMessage("Please fill all required fields and select a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("department", form.department);
    formData.append("photo", form.photo);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData
      );
      setMessage(res.data.message || "User registered successfully!");
      setForm({ name: "", email: "", department: "", photo: null });
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6e3", padding: "2rem" }}>
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "#fff",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#d6336c" }}>
          Register User
        </h2>

        {message && (
          <p
            style={{
              textAlign: "center",
              marginBottom: "1rem",
              color: message.includes("success") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
            style={{ padding: "0.8rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            style={{ padding: "0.8rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            style={{ padding: "0.8rem", borderRadius: "0.5rem", border: "1px solid #ccc" }}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </select>

          <input
            type="file"
            name="photo"
            accept="image/png, image/jpeg"
            onChange={handleChange}
            style={{ padding: "0.5rem" }}
          />

          <button
            type="submit"
            style={{
              background: "#d6336c",
              color: "#fff",
              padding: "0.8rem",
              borderRadius: "0.5rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
