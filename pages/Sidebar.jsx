import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="d-flex flex-column bg-dark text-white p-3" style={{ height: "100vh", width: "220px" }}>
      <h3 className="text-center mb-4">Employee</h3>

      <Link className="text-white mb-3" to="/dashboard">🏠 Dashboard</Link>
      <Link className="text-white mb-3" to="/attendance/mark">📸 Mark Attendance</Link>
      <Link className="text-white mb-3" to="/attendance/history">📊 Attendance History</Link>
      <Link className="text-white mt-3" to="/profile">👤 My Profile</Link>

      <hr className="bg-light"/>
      <button className="btn btn-danger mt-2">Logout</button>
    </div>
  );
}

export default Sidebar;
