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
import { ArrowLeft, Brain, Check, Eye, EyeOff, Users } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ParentRegister: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Theme Colors matching ParentLogin
  const THEME = {
    cyan: "#3fa8d2",
    brown: "#483a35",
    brownLight: "#6d5a52",
    white: "#ffffff",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/auth/register/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: formData.email,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Registration failed");
      }

      toast({
        title: "Registration Successful! 🎉",
        description:
          "Please check your email to verify your account before logging in.",
      });

      setIsLoading(false);
      navigate("/auth/parent/login");
    } catch (err) {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: (err as Error).message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-[#3fa8d2] selection:text-white font-sans overflow-x-hidden relative flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="neural-grid-parent-reg"
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
          <rect
            width="100%"
            height="100%"
            fill="url(#neural-grid-parent-reg)"
          />
        </svg>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3fa8d2] rounded-full blur-[120px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#483a35] rounded-full blur-[100px] opacity-5" />
      </div>
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="w-12 h-12" style={{ color: THEME.cyan }} />
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: THEME.cyan }}
              ></div>
            </div>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: THEME.brown }}
          >
            NeuroNurture
          </h1>
          <p style={{ color: THEME.brownLight }}>Parent Portal</p>
        </div>

        {/* Registration Card */}
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
              Create Account
            </CardTitle>
            <CardDescription style={{ color: THEME.brownLight }}>
              Create your account to start tracking your child's development.
              You'll add personal details later.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="h-11 border-gray-200 focus-visible:ring-[#3fa8d2] focus-visible:border-[#3fa8d2]"
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus-visible:ring-[#3fa8d2] focus-visible:border-[#3fa8d2] pr-12"
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

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <Check
                          className={`w-3 h-3 mr-2 ${
                            req.met ? "text-green-500" : "text-gray-300"
                          }`}
                        />
                        <span
                          className={
                            req.met ? "text-green-600" : "text-gray-500"
                          }
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                  style={{ color: THEME.brown }}
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus-visible:ring-[#3fa8d2] focus-visible:border-[#3fa8d2] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: THEME.brownLight }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 border-gray-300 rounded mt-1"
                  style={{ accentColor: THEME.cyan }}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm"
                  style={{ color: THEME.brownLight }}
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium hover:opacity-80 transition-opacity"
                    style={{ color: THEME.cyan }}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium hover:opacity-80 transition-opacity"
                    style={{ color: THEME.cyan }}
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-white font-medium shadow-lg transition-all"
                style={{ backgroundColor: THEME.cyan }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: THEME.brownLight }}>
                Already have an account?{" "}
                <Link
                  to="/auth/parent/login"
                  className="font-medium hover:opacity-80 transition-opacity"
                  style={{ color: THEME.cyan }}
                >
                  Sign in
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
  );
};

export default ParentRegister;
