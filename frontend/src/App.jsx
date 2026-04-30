// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ConsumerForm from "./pages/ConsumerForm";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>

      <div className="flex flex-col min-h-screen">

        {/* NAVBAR */}
        <Navbar />

        {/* MAIN CONTENT */}
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/register" element={<ConsumerForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <Footer />

      </div>

    </Router>
  );
}

export default App;