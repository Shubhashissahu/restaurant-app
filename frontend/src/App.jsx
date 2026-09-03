import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ConsumerForm from "./pages/ConsumerForm";
import Dashboard from "./pages/Dashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import { useState } from "react";
import { Toaster } from "react-hot-toast";

function AppContent({ token, setToken }) {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/manager");

  return (
    <div className="flex flex-col min-h-screen bg-[#141414] text-[#FAF7F2]">
      {/* NAVBAR */}
      <Navbar token={token} setToken={setToken} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1E1E1E",
            color: "#FAF7F2",
            border: "1px solid #3A2E24",
          },
        }}
      />

      {/* MAIN */}
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/register" element={<ConsumerForm />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<SignUp setToken={setToken} />} />

          {/* ADMIN PROTECTED ROUTE */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute token={token} allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* MANAGER PROTECTED ROUTE */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute token={token} allowedRoles={["manager", "admin"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Conditionally hide public marketing footer on dashboard views */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <AppContent token={token} setToken={setToken} />
    </Router>
  );
}

export default App;