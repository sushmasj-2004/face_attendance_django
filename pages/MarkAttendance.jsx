import { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";

function MarkAttendance() {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 720 });

    if (!imageSrc) {
      setResult({ status: "error", message: "Camera not ready. Try again." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/start/",
        { image: imageSrc },
        { headers: { "Content-Type": "application/json" } }
      );

      setResult(res.data); // store full response
    } catch (err) {
      setResult({
        status: "failed",
        message: "Face not recognized. Try again."
      });
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Mark Attendance</h2>

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        screenshotQuality={1}     // ✔ high quality
        videoConstraints={videoConstraints}
        width={400}
        className="rounded shadow"
      />

      <button
        className="btn btn-primary mt-3"
        onClick={capture}
        disabled={loading}
      >
        {loading ? "Processing..." : "Capture & Mark Attendance"}
      </button>

      {/* RESULT SECTION */}
      {result && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <p><strong>Status:</strong> {result.status}</p>
          {result.name && <p><strong>Name:</strong> {result.name}</p>}
          {result.email && <p><strong>Email:</strong> {result.email}</p>}
          {result.distance && <p><strong>Distance:</strong> {result.distance.toFixed(2)}</p>}
          <p><strong>Message:</strong> {result.message}</p>
        </div>
      )}
    </div>
  );
}

export default MarkAttendance;
