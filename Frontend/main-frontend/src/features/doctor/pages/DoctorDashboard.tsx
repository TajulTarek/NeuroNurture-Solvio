import SubscriptionStatus from "@/features/doctor/components/SubscriptionStatus";
import { useDoctorAuth } from "@/features/doctor/contexts/DoctorAuthContext";
import {
  DashboardStats,
  DoctorDashboardService,
} from "@/shared/services/doctorDashboardService";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Download,
  MessageSquare,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DoctorDashboard: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    averageProgress: 0,
    totalSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme Constants matching DoctorLogin
  const THEME = {
    primary: "#9333ea", // Purple
    primaryDark: "#7e22ce",
    brown: "#483a35",
    brownLight: "#6d5a52",
  };

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!doctor?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching dashboard stats for doctor:", doctor.id);
        const stats = await DoctorDashboardService.getDashboardStats(doctor.id);
        setDashboardStats(stats);

        console.log("Dashboard stats loaded:", stats);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [doctor?.id]);

  // DoctorAuthGuard handles authentication, so we can assume doctor exists here

  // Check if doctor has active premium subscription
  const isPremiumActive = () => {
    if (!doctor?.subscriptionExpiry) return false;
    return new Date(doctor.subscriptionExpiry) > new Date();
  };

  // Premium features list
  const premiumFeatures = [
    {
      icon: Users,
      title: "Unlimited Patients",
      description: "Add and manage unlimited patients without any restrictions",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Get detailed insights and reports on patient progress and outcomes",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: MessageSquare,
      title: "Priority Support",
      description:
        "Get priority support and faster response times for all your needs",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export patient data and reports in multiple formats",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Advanced security features and data protection",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Zap,
      title: "Advanced Tools",
      description: "Access to premium assessment tools and features",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const stats = [
    {
      name: "My Patients",
      value: dashboardStats.activePatients,
      icon: Users,
      color: "bg-[#9333ea]",
      href: "/doctor/children",
      subtitle: `of ${doctor?.maxChildren || 3} max`,
    },
    {
      name: "Active Tasks",
      value: dashboardStats.activeTasks,
      icon: BookOpen,
      color: "bg-green-500",
      href: "/doctor/tasks",
      subtitle: "currently assigned",
    },
    {
      name: "Completed Tasks",
      value: dashboardStats.completedTasks,
      icon: CheckCircle,
      color: "bg-blue-500",
      href: "/doctor/tasks/history",
      subtitle: "this month",
    },
    {
      name: "Avg. Progress",
      value: `${dashboardStats.averageProgress}%`,
      icon: TrendingUp,
      color: "bg-[#7e22ce]",
      href: "/doctor/children",
      subtitle: "across all patients",
    },
  ];

  const quickActions = [
    {
      name: "Assign Task",
      description: "Create therapeutic exercises",
      icon: BookOpen,
      href: "/doctor/tasks",
      color: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
    },
    {
      name: "View Progress",
      description: "Monitor patient development",
      icon: BarChart3,
      href: "/doctor/children",
      color:
        "bg-[#9333ea]/10 text-[#9333ea] hover:bg-[#9333ea]/20 border-[#9333ea]/20",
    },
    {
      name: "Chat with Patient",
      description: "Direct communication",
      icon: MessageSquare,
      href: "/doctor/chat",
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      name: "Task History",
      description: "Review completed activities",
      icon: Clock,
      href: "/doctor/tasks/history",
      color:
        "bg-[#7e22ce]/10 text-[#7e22ce] hover:bg-[#7e22ce]/20 border-[#7e22ce]/20",
    },
  ];

  return (
    <div className="py-2">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#9333ea] via-[#7e22ce] to-[#6b21a8] rounded-2xl p-4 sm:p-6 text-white shadow-xl mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white drop-shadow-sm">
              Welcome back, Dr. {doctor?.name?.split(" ")[1] || "Doctor"}!
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-4 drop-shadow-sm">
              Here's your therapeutic practice overview for today
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/90 drop-shadow-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                <span>{doctor?.specialization || "Pediatric Therapist"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link
              to="/doctor/tasks"
              className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30 shadow-sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Assign Task
            </Link>
            <Link
              to="/doctor/chat"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#9333ea] text-sm font-medium rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-4">
        <SubscriptionStatus />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gray-300">
                  <div className="h-6 w-6"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">
                  Error Loading Statistics
                </p>
                <p className="text-lg text-red-500">{error}</p>
                <p className="text-xs text-red-400">Please refresh the page</p>
              </div>
            </div>
          </div>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                to={stat.href}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-[#9333ea]/30 hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.color} shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-[#9333ea] transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: THEME.brown }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border ${action.color} transition-all duration-200 hover:scale-105 hover:shadow-md`}
              >
                <Icon className="h-8 w-8 mb-3" />
                <h3 className="font-medium text-sm mb-1">{action.name}</h3>
                <p className="text-xs text-center opacity-80">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Premium Features and Upgrade Card - Only show for free users */}
      {!isPremiumActive() && (
        <>
          {/* Premium Features Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="text-center mb-6">
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: THEME.brown }}
              >
                Unlock Premium Features
              </h3>
              <p style={{ color: THEME.brownLight }}>
                Upgrade to access these powerful tools and unlimited patients
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`${feature.bgColor} rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start">
                    <feature.icon
                      className={`h-6 w-6 ${feature.color} mr-3 mt-1`}
                    />
                    <div>
                      <h4
                        className="font-medium mb-1"
                        style={{ color: THEME.brown }}
                      >
                        {feature.title}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: THEME.brownLight }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Call to Action */}
          <div className="bg-gradient-to-r from-[#9333ea] via-[#7e22ce] to-[#6b21a8] rounded-2xl p-4 sm:p-6 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-2xl font-bold mb-2">
                  Ready to unlock unlimited potential?
                </h2>
                <p className="text-white/90 text-base sm:text-lg mb-4">
                  Upgrade to premium and access all features with unlimited
                  patients
                </p>
                <p className="text-sm text-white/80">
                  Basic Plan • {3 - dashboardStats.activePatients} patient slots
                  available
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center">
                <Link
                  to="/doctor/subscription"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30 shadow-sm"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  View Premium Plans
                </Link>
                <div className="hidden md:block">
                  <Crown className="h-12 w-12 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
