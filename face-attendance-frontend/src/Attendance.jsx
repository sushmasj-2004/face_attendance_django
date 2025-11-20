import { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import React from "react";

export default function Attendance() {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const captureAndSend = async () => {
    setLoading(true);
    setStatus("");

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setStatus("❌ Webcam not ready. Please allow camera access.");
      setLoading(false);
      return;
    }

    const base64Data = imageSrc.split(",")[1];

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/start/",
        { image: base64Data },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.status === "success") {
        setStatus(`✅ Attendance marked for ${res.data.name}`);
      } else if (res.data.status === "exists") {
        setStatus(`⚠️ ${res.data.message}`);
      } else {
        setStatus("❌ Face not recognised. Try again.");
      }
    } catch (err) {
      console.error(err.response || err);
      setStatus("❌ Error marking attendance");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #fcd5ce, #ffe5d9, #fff3b0)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "3rem",
          fontWeight: "800",
          color: "#d6336c",
          textAlign: "center",
          marginBottom: "2rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        Mark Your Attendance
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: "2rem",
          boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
          padding: "2rem",
          maxWidth: "450px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderTop: "8px solid #d6336c",
        }}
      >
        {/* Webcam Box */}
        <div
          style={{
            width: "320px",
            height: "240px",
            marginBottom: "1.5rem",
            borderRadius: "1rem",
            overflow: "hidden",
            border: "4px dashed #f8b4b4",
            boxShadow: "inset 0 4px 10px rgba(0,0,0,0.1)",
            position: "relative",
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2px solid #d6336c",
              borderRadius: "1rem",
              pointerEvents: "none",
            }}
          ></div>
        </div>

        {/* Centered Button */}
        <button
          onClick={captureAndSend}
          disabled={loading}
          style={{
            width: "70%",
            padding: "1rem",
            borderRadius: "1rem",
            fontWeight: "700",
            fontSize: "1.2rem",
            color: "#fff",
            background: loading
              ? "#f8b4b4"
              : "linear-gradient(to right, #d6336c, #fca311, #fddb3a)",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Processing..." : "Mark Attendance"}
        </button>

        {/* Status Message */}
        {status && (
          <p
            style={{
              textAlign: "center",
              fontWeight: "600",
              color: status.includes("✅")
                ? "green"
                : status.includes("⚠️")
                ? "#ff8c00"
                : "red",
              marginBottom: "0.5rem",
            }}
          >
            {status}
          </p>
        )}

        {/* Helper Text */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#555",
          }}
        >
          Make sure your face is clearly visible for successful attendance.
        </p>
      </div>
    </div>
  );
}
