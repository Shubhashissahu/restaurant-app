// src/components/Footer.jsx
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-20">

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900"></div>

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10 text-gray-300">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Savory Bites
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Experience culinary excellence with fresh ingredients and
            authentic flavors. Where tradition meets innovation.
          </p>
        </div>

        {/* NAVIGATION */}
        <div>
          <h3 className="text-white font-semibold mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-teal-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-teal-400 transition">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-teal-400 transition">
                Register
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-teal-400 transition">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <div className="space-y-3 text-sm">

            <p className="flex items-center gap-2 hover:text-teal-400 transition">
              <Mail size={16} /> support@savorybites.com
            </p>

            <p className="flex items-center gap-2 hover:text-teal-400 transition">
              <Phone size={16} /> +91 98765 43210
            </p>

            <p className="flex items-center gap-2 hover:text-teal-400 transition">
              <MapPin size={16} /> Mumbai, India
            </p>

          </div>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="text-white font-semibold mb-4">Stay Updated</h3>

          <p className="text-sm text-gray-400 mb-3">
            Get latest offers & updates
          </p>

          <div className="flex bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10">
            <input
              type="email"
              placeholder="Enter email"
              className="bg-transparent px-3 py-2 text-sm text-white outline-none flex-1"
            />
            <button className="bg-teal-500 px-4 text-white text-sm hover:bg-teal-400 transition">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="relative border-t border-white/10 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Savory Bites — All rights reserved
      </div>

    </footer>
  );
}