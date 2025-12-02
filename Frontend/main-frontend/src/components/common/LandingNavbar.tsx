import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Brain,
  Home,
  Users,
  GraduationCap,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";

const LandingNavbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme Constants matching Landing Page
  const THEME = {
    cyan: "#3fa8d2",
    brown: "#483a35",
    activeBg: "rgba(63, 168, 210, 0.08)", // Very light cyan
  };

  const isActive = (path: string) => location.pathname === path;

  // Helper for consistent link styling
  const getLinkStyles = (path: string) => {
    const active = isActive(path);
    return `
      flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm
      ${
        active
          ? `text-[#3fa8d2] bg-[#3fa8d2]/10 font-semibold shadow-sm`
          : `text-[#483a35]/70 hover:text-[#3fa8d2] hover:bg-[#3fa8d2]/5`
      }
    `;
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#3fa8d2]/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#3fa8d2]/10 group-hover:bg-[#3fa8d2] transition-colors duration-300">
              <Brain className="h-6 w-6 text-[#3fa8d2] group-hover:text-white transition-colors duration-300" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: THEME.brown }}
            >
              Neuro<span style={{ color: THEME.cyan }}>Nurture</span>
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-2 bg-white/50 p-1.5 rounded-full border border-[#483a35]/5 shadow-sm">
            <Link to="/" className={getLinkStyles("/")}>
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>

            <div className="w-px h-4 bg-[#483a35]/10 mx-1"></div>

            <Link
              to="/auth/parent/login"
              className={getLinkStyles("/auth/parent/login")}
            >
              <Users className="h-4 w-4" />
              <span>Parent</span>
            </Link>

            <Link
              to="/auth/school/login"
              className={getLinkStyles("/auth/school/login")}
            >
              <GraduationCap className="h-4 w-4" />
              <span>School</span>
            </Link>

            <Link
              to="/auth/doctor/login"
              className={getLinkStyles("/auth/doctor/login")}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Doctor</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[#483a35] hover:bg-[#3fa8d2]/10 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#3fa8d2]/10 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-lg ${
                isActive("/")
                  ? "bg-[#3fa8d2]/10 text-[#3fa8d2]"
                  : "text-[#483a35]"
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              <span className="font-medium">Home</span>
            </Link>

            <div className="h-px bg-gray-100 my-2"></div>

            <p className="px-3 text-xs font-semibold text-[#483a35]/40 uppercase tracking-wider mb-2">
              Portals
            </p>

            <Link
              to="/auth/parent/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-lg ${
                isActive("/auth/parent/login")
                  ? "bg-[#3fa8d2]/10 text-[#3fa8d2]"
                  : "text-[#483a35]"
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              <span className="font-medium">Parent Access</span>
            </Link>

            <Link
              to="/auth/school/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-lg ${
                isActive("/auth/school/login")
                  ? "bg-[#3fa8d2]/10 text-[#3fa8d2]"
                  : "text-[#483a35]"
              }`}
            >
              <GraduationCap className="h-5 w-5 mr-3" />
              <span className="font-medium">School Access</span>
            </Link>

            <Link
              to="/auth/doctor/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-lg ${
                isActive("/auth/doctor/login")
                  ? "bg-[#3fa8d2]/10 text-[#3fa8d2]"
                  : "text-[#483a35]"
              }`}
            >
              <Stethoscope className="h-5 w-5 mr-3" />
              <span className="font-medium">Doctor Access</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
