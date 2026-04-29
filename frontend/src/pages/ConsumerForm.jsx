// src/pages/ConsumerForm.jsx
import { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { User, Mail, Phone } from "lucide-react";

const API = "http://localhost:5000/api";

export default function ConsumerForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)
      e.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!/^[0-9]{10}$/.test(form.phone))
      e.phone = "Phone must be exactly 10 digits";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/consumers`, form);
      setMessage("Registration successful! 🎉");
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      setMessage("Registration failed. Try again.",err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-2">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="text-gray-500 text-sm">
              Join Savory Bites today
            </p>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mb-4 text-sm p-3 rounded-lg ${
                message.includes("successful")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <div className="flex items-center border rounded-xl px-3 mt-1 focus-within:ring-2 focus-within:ring-teal-400">
                <User size={16} className="text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full p-2 outline-none"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <div className="flex items-center border rounded-xl px-3 mt-1 focus-within:ring-2 focus-within:ring-teal-400">
                <Mail size={16} className="text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full p-2 outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <div className="flex items-center border rounded-xl px-3 mt-1 focus-within:ring-2 focus-within:ring-teal-400">
                <Phone size={16} className="text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="w-full p-2 outline-none"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition"
            >
              {submitting ? "Registering..." : "Register"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}