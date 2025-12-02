import LandingNavbar from "@/components/common/LandingNavbar";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  Brain,
  Dna,
  Gamepad2,
  Globe2,
  Microscope,
  Network,
  Stethoscope,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // Strict Color Palette
  const THEME = {
    cyan: "#3fa8d2", // Neural/Tech
    brown: "#483a35", // Earth/Grounding
    brownLight: "#6d5a52", // Softer Text
    white: "#ffffff",
    glass: "rgba(255, 255, 255, 0.7)",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleSelection = (role: string) => {
    navigate(`/auth/${role}/login`);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#3fa8d2] selection:text-white font-sans overflow-x-hidden">
      <LandingNavbar />

      {/* --- HERO SECTION: The Neural Interface --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Typography & CTA */}
            <div
              className={`transition-all duration-1000 ${
                mounted
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3fa8d2]/30 bg-[#3fa8d2]/5 text-[#483a35] text-xs font-bold tracking-widest uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-[#3fa8d2] animate-pulse" />
                AI-Powered Autism Detection
              </div>

              <h1
                className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                style={{ color: THEME.brown }}
              >
                Autism Detection <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3fa8d2] to-[#2c7a99]">
                  Through Growth.
                </span>
              </h1>

              <p
                className="text-lg lg:text-xl mb-8 max-w-lg leading-relaxed"
                style={{ color: THEME.brownLight }}
              >
                NeuroNurture combines cutting-edge AI technology with engaging
                gameplay to create a holistic approach to autism detection and
                child development.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() =>
                    document
                      .getElementById("portals")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-14 px-8 rounded-full text-white font-semibold shadow-lg shadow-[#3fa8d2]/20 hover:shadow-[#3fa8d2]/40 transition-all text-lg"
                  style={{ backgroundColor: THEME.cyan }}
                >
                  Get Started
                </Button>
                <Button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  variant="outline"
                  className="h-14 px-8 rounded-full border-2 font-semibold hover:bg-[#483a35]/5 transition-all text-lg bg-transparent"
                  style={{ borderColor: THEME.brown, color: THEME.brown }}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right: Abstract Medical Visualization */}
            <div
              className={`relative hidden lg:block transition-all duration-1000 delay-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Central Brain Node */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-tr from-[#3fa8d2]/10 to-white backdrop-blur-md border border-[#3fa8d2]/20 rounded-full flex items-center justify-center shadow-2xl z-20">
                    <Brain
                      className="w-32 h-32 text-[#3fa8d2]"
                      strokeWidth={1}
                    />
                  </div>
                </div>

                {/* Orbiting Satellites */}
                {[
                  {
                    icon: Stethoscope,
                    label: "Clinical",
                    delay: "0s",
                    pos: "top-0 right-10",
                  },
                  {
                    icon: Users,
                    label: "Family",
                    delay: "2s",
                    pos: "bottom-10 right-0",
                  },
                  {
                    icon: Network,
                    label: "School",
                    delay: "4s",
                    pos: "bottom-20 left-10",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`absolute ${item.pos} animate-bounce`}
                    style={{
                      animationDuration: "6s",
                      animationDelay: item.delay,
                    }}
                  >
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-[#483a35]/10 flex flex-col items-center gap-2 w-28">
                      <item.icon className="w-6 h-6 text-[#483a35]" />
                      <span className="text-xs font-bold text-[#483a35]">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PORTALS SECTION: Clean Clinical Entry Points --- */}
      <section id="portals" className="py-24 bg-[#f8fcfd] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: THEME.brown }}
            >
              Select Access Portal
            </h2>
            <div className="w-24 h-1 bg-[#3fa8d2] mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: "parent",
                label: "Family Guardian",
                icon: Users,
                desc: "Autism detection, AI insights, dedicated AI agent, and growth through interactive gameplay.",
              },
              {
                id: "school",
                label: "Educational Institute",
                icon: Globe2,
                desc: "Competition management, progress tracking, child comparison, task assignment, and dedicated AI agent.",
              },
              {
                id: "doctor",
                label: "Clinical Specialist",
                icon: Activity,
                desc: "Patient progress tracking, dedicated chat system, task management, and dedicated AI agent.",
              },
            ].map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelection(role.id)}
                className="group relative bg-white rounded-t-lg rounded-b-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-100"
              >
                {/* Top colored line */}
                <div className="h-1.5 w-full bg-[#3fa8d2] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#3fa8d2]/10 flex items-center justify-center mb-6 group-hover:bg-[#3fa8d2] transition-colors duration-300">
                    <role.icon className="w-7 h-7 text-[#3fa8d2] group-hover:text-white transition-colors" />
                  </div>

                  <h3
                    className="text-xl font-bold mb-3 flex items-center justify-between"
                    style={{ color: THEME.brown }}
                  >
                    {role.label}
                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#3fa8d2]" />
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: THEME.brownLight }}
                  >
                    {role.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SCIENCE & FEATURES: The "Why" --- */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-4xl font-bold mb-6"
                style={{ color: THEME.brown }}
              >
                AI-Powered Platform <br />
                <span style={{ color: THEME.cyan }}>for Autism Detection</span>
              </h2>
              <p className="text-lg leading-relaxed text-gray-600 max-w-2xl mx-auto">
                A comprehensive microservices-based platform designed to detect
                autism in children and provide personalized growth tracking
                through AI-powered insights, gameplay, and professional
                supervision.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Advanced AI Algorithms",
                  desc: "Advanced AI algorithms to detect early signs of autism in children.",
                  icon: Dna,
                },
                {
                  title: "Interactive Games",
                  desc: "Engaging games designed to promote development while having fun.",
                  icon: Gamepad2,
                },
                {
                  title: "Nuru AI Agent",
                  desc: "Personalized AI assistant for tracking and supporting growth journey.",
                  icon: Microscope,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full border border-[#3fa8d2]/30 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[#3fa8d2]" />
                    </div>
                  </div>
                  <div>
                    <h4
                      className="text-lg font-bold mb-1"
                      style={{ color: THEME.brown }}
                    >
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER: Professional & Minimal --- */}
      <footer className="bg-[#483a35] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-8 h-8 text-[#3fa8d2]" />
                <span className="text-xl font-bold tracking-tight">
                  NeuroNurture
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                An AI-Powered Autism Detection and Growth Platform for Children.
                Empowering children with autism through technology and care.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#3fa8d2]">Platform</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Autism Detection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Growth Through Gameplay
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    AI Insights
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#3fa8d2]">Research</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Methodology
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Publications
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#3fa8d2]">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    HIPAA Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>© 2025 NeuroNurture. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Sylhet, Bangladesh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
