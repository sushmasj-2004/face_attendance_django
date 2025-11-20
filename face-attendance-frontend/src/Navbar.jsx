import { useNavigate } from "react-router-dom";
import "./Home.css";
import React from "react";
import axios from "axios"; 
export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      // Call Django logout endpoint
      await axios.post("http://127.0.0.1:8000/api/logout/", {}, {
        withCredentials: true // if using session authentication
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="home-container">
      {/* Top dashboard bar */}
      <header className="dashboard-bar">
        <h1 className="dashboard-title">Face Attendance System</h1>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/register")}>Register User</button>
          <button onClick={() => navigate("/attendance")}>Mark Attendance</button>
          <button onClick={() => navigate("/logout")}>Logout</button>
        </div>
      </header>

      {/* Optional center content */}
      <div className="home-content">
        <p>Welcome! To PIX Face Attendance App</p>
      </div>
    </div>
  );
}
