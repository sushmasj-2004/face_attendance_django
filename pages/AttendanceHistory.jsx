import { useEffect, useState } from "react";
import axios from "axios";

function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const email = localStorage.getItem("email"); // ✔ get logged-in email

  useEffect(() => {
    if (!email) {
      console.error("Email not found in localStorage");
      return;
    }

    axios.get("http://127.0.0.1:8000/api/myattendance/", {
      params: { email }  // ✔ send email to backend
    })
      .then(res => {
        // ✔ convert timestamp → date + time
        const parsed = res.data.map(item => {
          const [date, time] = item.timestamp.split(" ");
          return { date, time, status: item.status };
        });
        setRecords(parsed);
      })
      .catch(err => console.error(err));
  }, [email]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">My Attendance History</h2>

      <table className="table table-bordered mt-3 w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Time In</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td className="p-2 border">{r.date}</td>
              <td className="p-2 border">{r.time}</td>
              <td className="p-2 border">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceHistory;

