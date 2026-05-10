// src/pages/ConsumerForm.jsx

import { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

import {
  User,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

const API = "http://localhost:5000/api";

export default function ConsumerForm() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // VALIDATION
  const validate = () => {

    const e = {};

    if (!form.name.trim() || form.name.length < 2) {
      e.name = "Name must be at least 2 characters";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      e.phone = "Phone must be exactly 10 digits";
    }

    return e;
  };

  // INPUT CHANGE
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // SUBMIT
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

      setForm({
        name: "",
        email: "",
        phone: "",
      });

    } catch (err) {

      console.error(err);

      setMessage("Registration failed. Try again.");

    } finally {

      setSubmitting(false);

    }
  };

  // INPUT STYLE
  const INPUT =
    "w-full bg-transparent py-3 pl-3 outline-none text-[#FAF7F2] placeholder:text-[#8B7E6A]";

  return (
    <>
      <Helmet>
        <title>Register | Savory Bites</title>
      </Helmet>

      <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4 py-20 relative overflow-hidden">

        {/* GOLD GLOW */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#D4A373]/10 blur-3xl rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5E3C]/10 blur-3xl rounded-full"></div>

        {/* CARD */}
        <div className="relative w-full max-w-md bg-[#1E1E1E]/95 backdrop-blur-xl border border-[#3A2E24] rounded-3xl shadow-2xl p-8 overflow-hidden">

          {/* TOP GOLD LINE */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4A373] to-[#8B5E3C]"></div>

          {/* HEADER */}
          <div className="text-center mb-8">

            <div className="inline-flex items-center gap-2 bg-[#2A2A2A] border border-[#3A2E24] px-4 py-2 rounded-full text-[#D4A373] text-xs font-bold uppercase tracking-[0.2em] mb-5">

              Join Savory Bites

            </div>

            <h1 className="text-4xl font-bold text-[#FAF7F2] mb-2">
              Create Account
            </h1>

            <p className="text-[#C2B59B] text-sm">
              Experience premium dining with us
            </p>

          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`mb-5 text-sm p-4 rounded-2xl border ${
                message.includes("successful")
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}
            <div>

              <label className="text-sm text-[#D4A373] font-medium mb-2 block">
                Full Name
              </label>

              <div className="flex items-center bg-[#2A2A2A] border border-[#3A2E24] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#D4A373] transition-all duration-300">

                <User
                  size={18}
                  className="text-[#D4A373]"
                />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={INPUT}
                />

              </div>

              {errors.name && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.name}
                </p>
              )}

            </div>

            {/* EMAIL */}
            <div>

              <label className="text-sm text-[#D4A373] font-medium mb-2 block">
                Email Address
              </label>

              <div className="flex items-center bg-[#2A2A2A] border border-[#3A2E24] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#D4A373] transition-all duration-300">

                <Mail
                  size={18}
                  className="text-[#D4A373]"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={INPUT}
                />

              </div>

              {errors.email && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.email}
                </p>
              )}

            </div>

            {/* PHONE */}
            <div>

              <label className="text-sm text-[#D4A373] font-medium mb-2 block">
                Phone Number
              </label>

              <div className="flex items-center bg-[#2A2A2A] border border-[#3A2E24] rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#D4A373] transition-all duration-300">

                <Phone
                  size={18}
                  className="text-[#D4A373]"
                />

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={INPUT}
                />

              </div>

              {errors.phone && (
                <p className="text-red-400 text-xs mt-2">
                  {errors.phone}
                </p>
              )}

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="group w-full bg-[#D4A373] hover:bg-[#8B5E3C] active:scale-[0.98] text-[#141414] py-4 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >

              {submitting
                ? "Registering..."
                : "Create Account"}

              {!submitting && (
                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              )}

            </button>

          </form>

          {/* FOOTER TEXT */}
          <p className="text-center text-xs text-[#8B7E6A] mt-8 leading-relaxed">

            By registering, you agree to our terms and
            privacy policy.

          </p>

        </div>
      </div>
    </>
  );
}