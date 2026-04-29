// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu"; 
import ConsumerForm from "./pages/ConsumerForm";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";  

function App() {
  return (
    <Router>
    
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/register" element={<ConsumerForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;