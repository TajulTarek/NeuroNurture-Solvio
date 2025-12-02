import { useDoctorAuth } from "@/features/doctor/contexts/DoctorAuthContext";
import {
  BookOpen,
  ChevronDown,
  Crown,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const DoctorNavbar: React.FC = () => {
  const { doctor, logout } = useDoctorAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Theme Constants matching DoctorLogin
  const THEME = {
    primary: "#9333ea", // Purple
    primaryDark: "#7e22ce",
    brown: "#483a35",
    brownLight: "#6d5a52",
    activeBg: "rgba(147, 51, 234, 0.08)", // Very light purple
  };

  const navigation = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: Home },
    { name: "My Patients", href: "/doctor/children", icon: Users },
    { name: "Task Management", href: "/doctor/tasks", icon: BookOpen },
    { name: "Chat", href: "/doctor/chat", icon: MessageSquare },
    { name: "Support Tickets", href: "/doctor/tickets", icon: HelpCircle },
  ];

  const isSubscriptionActive = () => {
    if (!doctor?.subscriptionExpiry) return false;
    return new Date(doctor.subscriptionExpiry) > new Date();
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/doctor/login");
  };

  const isActive = (path: string) => location.pathname === path;

  // Helper for consistent link styling
  const getLinkStyles = (path: string) => {
    const active = isActive(path);
    return `
      flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm
      ${
        active
          ? `text-[#9333ea] bg-[#9333ea]/10 font-semibold shadow-sm`
          : `text-[#483a35]/70 hover:text-[#9333ea] hover:bg-[#9333ea]/5`
      }
    `;
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#9333ea]/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link
            to="/doctor/dashboard"
            className="flex items-center gap-2 group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#9333ea]/10 group-hover:bg-[#9333ea] transition-colors duration-300">
              <Stethoscope className="h-6 w-6 text-[#9333ea] group-hover:text-white transition-colors duration-300" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: THEME.brown }}
            >
              Neuro<span style={{ color: THEME.primary }}>Nurture</span>
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center space-x-2 bg-white/50 p-1.5 rounded-full border border-[#483a35]/5 shadow-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={getLinkStyles(item.href)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right side - Subscription and Doctor Info */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {/* Subscription Button */}
            <Link
              to="/doctor/subscription"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                isSubscriptionActive()
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                  : "bg-yellow-500 text-black hover:bg-yellow-400 shadow-sm"
              }`}
            >
              <Crown className="mr-2 h-4 w-4" />
              {isSubscriptionActive() ? "Premium" : "Upgrade"}
            </Link>

            {/* Doctor Info Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#9333ea]/10 transition-colors"
                style={{ color: THEME.brown }}
              >
                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color: THEME.brown }}
                  >
                    {doctor?.name}
                  </p>
                  <p className="text-xs" style={{ color: THEME.brownLight }}>
                    Doctor
                  </p>
                </div>
                <ChevronDown
                  className="h-4 w-4"
                  style={{ color: THEME.brownLight }}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#9333ea]/10 py-2 z-50">
                  <div className="px-4 py-3 border-b border-[#9333ea]/10">
                    <p
                      className="text-sm font-medium"
                      style={{ color: THEME.brown }}
                    >
                      {doctor?.name}
                    </p>
                    <p className="text-xs" style={{ color: THEME.brownLight }}>
                      {doctor?.email}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          isSubscriptionActive()
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isSubscriptionActive() ? "Premium" : "Free"} Plan
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#9333ea]/10 flex items-center transition-colors rounded-md"
                    style={{ color: THEME.brown }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[#9333ea]/10 transition-colors focus:outline-none"
              style={{ color: THEME.brown }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#9333ea]/10 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center p-3 rounded-lg ${
                  isActive(item.href)
                    ? "bg-[#9333ea]/10 text-[#9333ea]"
                    : "text-[#483a35]"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-2"></div>

            {/* Mobile Subscription Button */}
            <Link
              to="/doctor/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-lg ${
                isSubscriptionActive()
                  ? "bg-green-500 text-white"
                  : "bg-yellow-500 text-black"
              }`}
            >
              <Crown className="h-5 w-5 mr-3" />
              <span className="font-medium">
                {isSubscriptionActive() ? "Premium Active" : "Subscription"}
              </span>
            </Link>

            <div className="pt-4 border-t border-[#9333ea]/10">
              <div className="px-3 py-2 mb-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: THEME.brown }}
                >
                  {doctor?.name}
                </p>
                <p className="text-xs" style={{ color: THEME.brownLight }}>
                  {doctor?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium hover:bg-[#9333ea]/10 rounded-md transition-colors"
                style={{ color: THEME.brown }}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DoctorNavbar;
