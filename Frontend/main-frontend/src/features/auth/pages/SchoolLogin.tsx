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
import { ArrowLeft, Brain, Eye, EyeOff, GraduationCap } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SchoolLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme Colors - Green for School
  const THEME = {
    primary: "#16a34a", // Green
    primaryDark: "#15803d",
    brown: "#483a35",
    brownLight: "#6d5a52",
    white: "#ffffff",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8091/api/school/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("School login response:", data);
        console.log("JWT Token received:", data.token);
        console.log(
          "Backend subscriptionStatus:",
          data.school.subscriptionStatus
        );
        console.log("Backend subscriptionPlan:", data.school.subscriptionPlan);
        console.log(
          "Backend subscriptionExpiry:",
          data.school.subscriptionExpiry
        );

        // Store token and school data
        localStorage.setItem("schoolToken", data.token);
        localStorage.setItem("schoolEmail", formData.email);

        const schoolData = {
          id: data.school.id.toString(),
          name: data.school.schoolName,
          email: data.school.email,
          address: `${data.school.address}, ${data.school.city}, ${data.school.state} ${data.school.zipCode}`,
          phone: data.school.phone,
          subscriptionStatus: data.school.subscriptionStatus,
          subscriptionPlan: data.school.subscriptionPlan || "free",
          subscriptionExpiry: data.school.subscriptionExpiry,
          childrenLimit: data.school.childrenLimit,
          currentChildren: data.school.currentChildren,
        };

        console.log("Parsed school data:", schoolData);
        console.log(
          "Parsed subscriptionExpiry:",
          schoolData.subscriptionExpiry
        );
        console.log("Parsed subscriptionPlan:", schoolData.subscriptionPlan);

        localStorage.setItem("schoolAuth", JSON.stringify(schoolData));
        navigate("/school/dashboard");
      } else {
        const errorText = await response.text();
        if (errorText.includes("email verification")) {
          setError(
            "Please verify your email before logging in. Check your email for verification instructions."
          );
        } else if (errorText.includes("admin approval")) {
          setError(
            "Your school account is pending admin approval. You will be notified once approved."
          );
          // Store email for status checking
          localStorage.setItem("schoolEmail", formData.email);
          navigate("/school/pending-approval");
        } else {
          setError("Invalid email or password.");
        }
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-green-500 selection:text-white font-sans overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Grid Pattern representing neural mesh */}
        <svg
          className="absolute w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="neural-grid-school"
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
          <rect width="100%" height="100%" fill="url(#neural-grid-school)" />
        </svg>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[120px] opacity-10 animate-pulse" />
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
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h1
                className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
                style={{ color: THEME.brown }}
              >
                School Features
              </h1>
              <p className="text-lg mb-8" style={{ color: THEME.brownLight }}>
                Comprehensive tools for educational institutions
              </p>
            </div>

            <div className="space-y-4 text-left">
              {[
                {
                  title: "Progress Tracking",
                  desc: "Track each child's developmental progress with detailed analytics",
                },
                {
                  title: "Competition Management",
                  desc: "Arrange and manage educational competitions among students",
                },
                {
                  title: "Task Assignment",
                  desc: "Assign developmental tasks and track completion efficiently",
                },
                {
                  title: "Comparative Analysis",
                  desc: "Compare progress among children for better insights",
                },
                {
                  title: "AI-Powered Insights",
                  desc: "Dedicated AI Agent for getting comprehensive insights of enrolled children",
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
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle
                  className="text-2xl font-bold"
                  style={{ color: THEME.brown }}
                >
                  School Access
                </CardTitle>
                <CardDescription style={{ color: THEME.brownLight }}>
                  Sign in to manage child development and organize competitions
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium"
                      style={{ color: THEME.brown }}
                    >
                      School Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-gray-200 focus-visible:ring-green-500 focus-visible:border-green-500"
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
                        className="h-12 border-gray-200 pr-12 focus-visible:ring-green-500 focus-visible:border-green-500"
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
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 border-gray-300 rounded"
                        style={{ accentColor: THEME.primary }}
                      />
                      <label
                        htmlFor="remember"
                        className="ml-2 text-sm"
                        style={{ color: THEME.brownLight }}
                      >
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/auth/school/forgot-password"
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
                      "Access School Portal"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm" style={{ color: THEME.brownLight }}>
                    New to NeuroNurture?{" "}
                    <Link
                      to="/auth/school/register"
                      className="font-medium hover:opacity-80 transition-opacity"
                      style={{ color: THEME.primary }}
                    >
                      Register your school
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

export default SchoolLoginForm;
