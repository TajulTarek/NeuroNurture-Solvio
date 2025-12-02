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
import { useToast } from "@/components/ui/use-toast";
import { AuthSuccessHandler } from "@/features/auth/components/AuthSuccessHandler";
import { ArrowLeft, Brain, Eye, EyeOff, Users } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ParentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthHandler, setShowAuthHandler] = useState(false);

  // Theme Colors matching LandingPage
  const THEME = {
    cyan: "#3fa8d2", // Neural/Tech
    brown: "#483a35", // Earth/Grounding
    brownLight: "#6d5a52", // Softer Text
    white: "#ffffff",
    glass: "rgba(255, 255, 255, 0.7)",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Oops! 😅",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://188.166.197.135:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
        }),
      });

      if (res.status === 401) {
        // Check if it's an email verification issue
        const errorText = await res.text();
        if (errorText.includes("Please verify your email")) {
          // Redirect to email verification required page
          navigate(
            `/email-verification-required?email=${encodeURIComponent(
              formData.email
            )}`
          );
          setIsLoading(false);
          return;
        }
      }

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      toast({
        title: "Welcome back! 🎉",
        description: "Successfully signed in!",
      });
      setIsLoading(false);
      setShowAuthHandler(true);
    } catch (err) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: (err as Error).message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    window.location.href =
      "http://188.166.197.135:8080/oauth2/authorization/google";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (showAuthHandler) {
    return <AuthSuccessHandler onComplete={() => setShowAuthHandler(false)} />;
  }

  return (
    <div className="min-h-screen bg-white selection:bg-[#3fa8d2] selection:text-white font-sans overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Grid Pattern representing neural mesh */}
        <svg
          className="absolute w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="neural-grid"
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
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3fa8d2] rounded-full blur-[120px] opacity-10 animate-pulse" />
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
                  <Brain className="w-16 h-16" style={{ color: THEME.cyan }} />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#3fa8d2] rounded-full animate-pulse"></div>
                </div>
              </div>
              <h1
                className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
                style={{ color: THEME.brown }}
              >
                Parent Features
              </h1>
              <p className="text-lg mb-8" style={{ color: THEME.brownLight }}>
                Comprehensive tools for parents and families
              </p>
            </div>

            <div className="space-y-4 text-left">
              {[
                {
                  title: "Autism Detection",
                  desc: "Advanced AI algorithms to detect early signs of autism in children",
                },
                {
                  title: "AI Insights",
                  desc: "Comprehensive AI-powered analysis and recommendations for child development",
                },
                {
                  title: "Dedicated AI Agent",
                  desc: "Personalized AI assistant for tracking and supporting your child's growth journey",
                },
                {
                  title: "Growth Through Gameplay",
                  desc: "Interactive games designed to promote development while having fun",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: THEME.cyan }}
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
                    style={{ backgroundColor: THEME.cyan }}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle
                  className="text-2xl font-bold"
                  style={{ color: THEME.brown }}
                >
                  Welcome Back
                </CardTitle>
                <CardDescription style={{ color: THEME.brownLight }}>
                  Sign in to track your child's development journey
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium"
                      style={{ color: THEME.brown }}
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-gray-200 focus-visible:ring-[#3fa8d2] focus-visible:border-[#3fa8d2]"
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
                        className="h-12 border-gray-200 pr-12 focus-visible:ring-[#3fa8d2] focus-visible:border-[#3fa8d2]"
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
                        style={{ accentColor: THEME.cyan }}
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
                      to="/auth/parent/forgot-password"
                      className="text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ color: THEME.cyan }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-white font-medium shadow-lg transition-all"
                    style={{
                      backgroundColor: THEME.cyan,
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Google Sign In */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 mt-4 border-gray-300 hover:bg-gray-50"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm" style={{ color: THEME.brownLight }}>
                    Don't have an account?{" "}
                    <Link
                      to="/auth/parent/register"
                      className="font-medium hover:opacity-80 transition-opacity"
                      style={{ color: THEME.cyan }}
                    >
                      Create account
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

export default ParentLogin;
