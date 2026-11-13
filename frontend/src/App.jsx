import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployerDashboard from "./pages/EmployerDashboard";
import HRDashboard from "./pages/HRDashboard";
import Login from "./pages/Login";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/employer" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/hr" element={<ProtectedRoute role="hr"><HRDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}