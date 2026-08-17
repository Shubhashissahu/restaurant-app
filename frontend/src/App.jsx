import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ConsumerForm from "./pages/ConsumerForm";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import { useState } from "react";
import { Toaster } from "react-hot-toast";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <div className="flex flex-col min-h-screen">

        {/* NAVBAR (now auth-aware) */}
        <Navbar token={token} setToken={setToken} />
        <Toaster position="top-center" />

        {/* MAIN */}
        <main className="flex-grow pt-16">
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/register" element={<ConsumerForm />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/signup" element={<SignUp setToken={setToken} />} />

            {/* PROTECTED ROUTE */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute token={token}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;