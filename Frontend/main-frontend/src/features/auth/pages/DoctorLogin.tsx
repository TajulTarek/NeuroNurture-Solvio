import LandingNavbar from "@/components/common/LandingNavbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDoctorAuth } from "@/features/doctor/contexts/DoctorAuthContext";
import { ArrowLeft, Brain, Eye, EyeOff, Stethoscope } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DoctorLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useDoctorAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Theme Colors - Purple for Doctor
  const THEME = {
    primary: "#9333ea", // Purple
    primaryDark: "#7e22ce",
    brown: "#483a35",
    brownLight: "#6d5a52",
    white: "#ffffff",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    clearError();

    const success = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (success) {
      navigate("/doctor/dashboard");
    } else {
      setLoginError("Login failed. Please check your credentials.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const displayError = error?.message || loginError;

  return (
    <div className="min-h-screen bg-white selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Grid Pattern representing neural mesh */}
        <svg
          className="absolute w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="neural-grid-doctor"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 40L40 0H20L0 20M40 40V20L20 40"
                stroke="#483a35"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid-doctor)" />
        </svg>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#483a35] rounded-full blur-[100px] opacity-5" />
      </div>

      {/* Navbar */}
      <LandingNavbar />

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen pt-32">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="relative">
                  <Brain
                    className="w-16 h-16"
                    style={{ color: THEME.primary }}
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h1
                className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
                style={{ color: THEME.brown }}
              >
                Doctor Features
              </h1>
              <p className="text-lg mb-8" style={{ color: THEME.brownLight }}>
                Comprehensive tools for medical professionals
              </p>
            </div>

            <div className="space-y-4 text-left">
              {[
                {
                  title: "Patient Progress Tracking",
                  desc: "Monitor and track patient development over time with detailed analytics",
                },
                {
                  title: "Task Assignment",
                  desc: "Assign therapeutic tasks and track completion for better outcomes",
                },
                {
                  title: "Patient Communication",
                  desc: "Seamless chat with patients and their families for ongoing support",
                },
                {
                  title: "AI-Powered Insights",
                  desc: "Dedicated AI Agent for getting comprehensive insights of patient progress",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: THEME.primary }}
                  ></div>
                  <div>
                    <span
                      className="text-base font-semibold block mb-1"
                      style={{ color: THEME.brown }}
                    >
                      {feature.title}
                    </span>
                    <span
                      className="text-sm block"
                      style={{ color: THEME.brownLight }}
                    >
                      {feature.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Login Card */}
            <Card className="shadow-2xl border border-gray-100 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: THEME.primary }}
                  >
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle
                  className="text-2xl font-bold"
                  style={{ color: THEME.brown }}
                >
                  Medical Access
                </CardTitle>
                <CardDescription style={{ color: THEME.brownLight }}>
                  Sign in to monitor patient development and manage therapeutic
                  interventions
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Display */}
                  {displayError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{displayError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium"
                      style={{ color: THEME.brown }}
                    >
                      Professional Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-gray-200 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium"
                      style={{ color: THEME.brown }}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-12 border-gray-200 pr-12 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        style={{ color: THEME.brownLight }}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="h-4 w-4 border-gray-300 rounded"
                        style={{ accentColor: THEME.primary }}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="ml-2 text-sm"
                        style={{ color: THEME.brownLight }}
                      >
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/auth/doctor/forgot-password"
                      className="text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ color: THEME.primary }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-white font-medium shadow-lg transition-all"
                    style={{
                      backgroundColor: THEME.primary,
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Access Medical Portal"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm" style={{ color: THEME.brownLight }}>
                    New to NeuroNurture?{" "}
                    <Link
                      to="/auth/doctor/register"
                      className="font-medium hover:opacity-80 transition-opacity"
                      style={{ color: THEME.primary }}
                    >
                      Register as Doctor
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back to Landing */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="inline-flex items-center text-sm hover:opacity-80 transition-opacity"
                style={{ color: THEME.brownLight }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to role selection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
