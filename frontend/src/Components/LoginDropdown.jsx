import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  ChevronDown,
  Crown,
  Briefcase,
  User,
  ChevronRight,
} from "lucide-react";

export default function LoginDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const options = [
    {
      label: "Admin Login",
      subtitle: "System & Settings",
      path: "/admin/login",
      icon: Crown,
      badgeColor: "bg-amber-500/15 text-[#D4A373]",
    },
    {
      label: "Manager Login",
      subtitle: "Menu & Operations",
      path: "/manager/login",
      icon: Briefcase,
      badgeColor: "bg-yellow-500/15 text-yellow-400",
    },
    {
      label: "User Login",
      subtitle: "Reservations & Orders",
      path: "/user/login",
      icon: User,
      badgeColor: "bg-blue-500/15 text-blue-400",
    },
  ];

  // Close dropdown on outside click or touch
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, [location.pathname]);

  // Handle keyboard events when dropdown is open or closed
  const handleButtonKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(options.length - 1);
    } else if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      buttonRef.current?.focus();
    }
  };

  const handleMenuKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Tab") {
      // Allow natural tab out, but close dropdown
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Focus active item when activeIndex changes
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].focus();
    }
  }, [isOpen, activeIndex]);

  const handleSelect = (path) => {
    setIsOpen(false);
    setActiveIndex(-1);
    navigate(path);
  };

  const isLoginActive =
    location.pathname === "/login" ||
    location.pathname === "/admin/login" ||
    location.pathname === "/manager/login" ||
    location.pathname === "/user/login";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Login Trigger Button */}
      <button
        ref={buttonRef}
        id="login-menu-button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="login-menu-dropdown"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] ${
          isOpen || isLoginActive
            ? "bg-[#FAF7F2] text-[#141414] shadow-md shadow-amber-500/10"
            : "bg-[#D4A373] text-[#141414] hover:bg-[#FAF7F2]"
        }`}
      >
        <LogIn size={16} />
        <span>Login</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="login-menu-dropdown"
          role="menu"
          aria-labelledby="login-menu-button"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full mt-2.5 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#3A2E24] shadow-2xl shadow-black/80 p-2 z-50 origin-top-right transition-all duration-150 ease-out animate-pop-in overflow-hidden"
        >
          {/* Subtle top amber highlight accent */}
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373]/50 to-transparent pointer-events-none" />

          {/* Section Header */}
          <div className="px-3 py-1.5 mb-1 border-b border-[#3A2E24]/60">
            <p className="text-[11px] uppercase tracking-wider text-[#C2B59B]/70 font-semibold">
              Select Portal
            </p>
          </div>

          <div className="space-y-1">
            {options.map((option, idx) => {
              const Icon = option.icon;
              const isSelected = location.pathname === option.path;
              const isFocused = activeIndex === idx;

              return (
                <button
                  key={option.path}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  role="menuitem"
                  type="button"
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => handleSelect(option.path)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer outline-none ${
                    isFocused || isSelected
                      ? "bg-[#2A2A2A] text-[#FAF7F2] border border-[#3A2E24]"
                      : "text-[#C2B59B] hover:bg-[#252525] hover:text-[#FAF7F2] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                        option.badgeColor
                      } group-hover:bg-[#D4A373] group-hover:text-[#141414]`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#FAF7F2] group-hover:text-[#FAF7F2] leading-tight">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-[#C2B59B]/80 group-hover:text-[#C2B59B] leading-tight mt-0.5">
                        {option.subtitle}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-[#C2B59B]/50 transition-transform duration-150 group-hover:text-[#D4A373] group-hover:translate-x-0.5"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
