import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorNavbar from "@/features/doctor/components/DoctorNavbar";
import { useDoctorAuth } from "@/features/doctor/contexts/DoctorAuthContext";
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DoctorTicketsPage = () => {
  const { doctor } = useDoctorAuth();
  const navigate = useNavigate();

  // Theme Constants matching DoctorLogin
  const THEME = {
    primary: "#9333ea", // Purple
    primaryDark: "#7e22ce",
    brown: "#483a35",
    brownLight: "#6d5a52",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="pt-28 px-4 max-w-7xl mx-auto py-2">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#9333ea] via-[#7e22ce] to-[#6b21a8] rounded-2xl p-4 sm:p-6 text-white shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
                  Support Tickets
                </h1>
              </div>
              <p className="text-white/90 text-base sm:text-lg mb-4 drop-shadow-sm">
                Manage your support requests and get help from our team
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/90 drop-shadow-sm">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Get assistance with any questions or issues</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => navigate("/doctor/tickets/new")}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#9333ea] text-sm font-medium rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Tickets
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: THEME.primary }}
                  >
                    0
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#9333ea]/10">
                  <Ticket
                    className="h-6 w-6"
                    style={{ color: THEME.primary }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Open Tickets
                  </p>
                  <p className="text-2xl font-bold text-orange-500">0</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold text-green-500">0</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="grid gap-6">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle
                className="flex items-center gap-2 text-xl"
                style={{ color: THEME.brown }}
              >
                <MessageSquare
                  className="h-5 w-5"
                  style={{ color: THEME.primary }}
                />
                Your Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Empty State */}
              <div className="text-center py-12 px-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-[#9333ea]/10">
                    <MessageSquare
                      className="h-12 w-12"
                      style={{ color: THEME.primary }}
                    />
                  </div>
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: THEME.brown }}
                >
                  No Tickets Yet
                </h3>
                <p
                  className="text-base mb-6 max-w-md mx-auto"
                  style={{ color: THEME.brownLight }}
                >
                  You haven't created any support tickets yet. Click "New
                  Ticket" to get started and our team will help you with any
                  questions or issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate("/doctor/tickets/new")}
                    className="inline-flex items-center justify-center px-6 py-3 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
                    style={{ backgroundColor: THEME.primary }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      style={{ color: THEME.primary }}
                    />
                    <div>
                      <h4
                        className="font-semibold mb-2"
                        style={{ color: THEME.brown }}
                      >
                        Need Help?
                      </h4>
                      <p
                        className="text-sm mb-3"
                        style={{ color: THEME.brownLight }}
                      >
                        Our support team is here to help you with:
                      </p>
                      <ul
                        className="text-sm space-y-1 list-disc list-inside"
                        style={{ color: THEME.brownLight }}
                      >
                        <li>Technical issues and troubleshooting</li>
                        <li>Account and subscription questions</li>
                        <li>Feature requests and feedback</li>
                        <li>General inquiries about the platform</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorTicketsPage;
