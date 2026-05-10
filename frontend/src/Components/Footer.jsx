// src/components/Footer.jsx

import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#141414]"></div>

      {/* GOLD GLOW */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#D4A373]/10 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#8B5E3C]/10 blur-3xl rounded-full"></div>

      {/* TOP BORDER */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent"></div>

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10 text-[#C2B59B]">

        {/* BRAND */}
        <div>
          <h2 className="text-3xl font-bold text-[#FAF7F2] mb-4 tracking-wide">
            Savory Bites
          </h2>

          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] mb-4"></div>

          <p className="text-sm leading-relaxed text-[#C2B59B]">
            Experience culinary excellence with fresh ingredients
            and authentic flavors. Where tradition meets innovation.
          </p>
        </div>

        {/* NAVIGATION */}
        <div>
          <h3 className="text-[#FAF7F2] font-semibold mb-5 text-lg">
            Navigation
          </h3>

          <ul className="space-y-3 text-sm">

            <li>
              <Link
                to="/"
                className="hover:text-[#D4A373] transition duration-300"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/menu"
                className="hover:text-[#D4A373] transition duration-300"
              >
                Menu
              </Link>
            </li>

            <li>
              <Link
                to="/register"
                className="hover:text-[#D4A373] transition duration-300"
              >
                Register
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard"
                className="hover:text-[#D4A373] transition duration-300"
              >
                Dashboard
              </Link>
            </li>

          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-[#FAF7F2] font-semibold mb-5 text-lg">
            Contact
          </h3>

          <div className="space-y-4 text-sm">

            <p className="flex items-center gap-3 hover:text-[#D4A373] transition duration-300">
              <Mail size={16} className="text-[#D4A373]" />
              support@savorybites.com
            </p>

            <p className="flex items-center gap-3 hover:text-[#D4A373] transition duration-300">
              <Phone size={16} className="text-[#D4A373]" />
              +91 98765 43210
            </p>

            <p className="flex items-center gap-3 hover:text-[#D4A373] transition duration-300">
              <MapPin size={16} className="text-[#D4A373]" />
              Mumbai, India
            </p>

          </div>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="text-[#FAF7F2] font-semibold mb-5 text-lg">
            Stay Updated
          </h3>

          <p className="text-sm text-[#C2B59B] mb-4">
            Get latest offers & updates
          </p>

          <div className="flex bg-[#1E1E1E] rounded-xl overflow-hidden border border-[#3A2E24]">

            <input
              type="email"
              placeholder="Enter email"
              className="bg-transparent px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none flex-1"
            />

            <button className="bg-[#D4A373] px-5 text-[#141414] text-sm font-semibold hover:bg-[#8B5E3C] hover:text-white transition duration-300">
              Subscribe
            </button>

          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="relative border-t border-[#3A2E24] text-center py-5 text-sm text-[#8B7E6A] bg-[#111111]">
        © {new Date().getFullYear()} Savory Bites — All rights reserved
      </div>

    </footer>
  );
}