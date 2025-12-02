import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DoctorNavbar from "@/features/doctor/components/DoctorNavbar";
import { useDoctorAuth } from "@/features/doctor/contexts/DoctorAuthContext";
import { ArrowLeft, Send, HelpCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DoctorNewTicketPage = () => {
  const { doctor } = useDoctorAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  // Theme Constants matching DoctorLogin
  const THEME = {
    primary: "#9333ea", // Purple
    primaryDark: "#7e22ce",
    brown: "#483a35",
    brownLight: "#6d5a52",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple alert for now
    alert(
      "Ticket created successfully! (This is a demo - no actual ticket was created)"
    );
    navigate("/doctor/tickets");
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
                  Create New Ticket
                </h1>
              </div>
              <p className="text-white/90 text-base sm:text-lg mb-4 drop-shadow-sm">
                Describe your issue and we'll help you resolve it quickly
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/90 drop-shadow-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>
                    Our support team typically responds within 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle
              className="flex items-center gap-2 text-xl"
              style={{ color: THEME.brown }}
            >
              <HelpCircle
                className="h-5 w-5"
                style={{ color: THEME.primary }}
              />
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: THEME.brown }}
                >
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                  className="h-12 border-gray-200 focus-visible:ring-[#9333ea] focus-visible:border-[#9333ea]"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: THEME.brown }}
                >
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger className="h-12 border-gray-200 focus:ring-[#9333ea] focus:border-[#9333ea]">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="medium">
                      Medium - Needs attention
                    </SelectItem>
                    <SelectItem value="high">High - Urgent issue</SelectItem>
                    <SelectItem value="urgent">
                      Urgent - Critical problem
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: THEME.brown }}
                >
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                  rows={8}
                  required
                  className="border-gray-200 focus-visible:ring-[#9333ea] focus-visible:border-[#9333ea]"
                />
                <p className="text-xs mt-2" style={{ color: THEME.brownLight }}>
                  The more details you provide, the faster we can help you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm"
                  style={{ backgroundColor: THEME.primary }}
                >
                  <Send className="h-4 w-4" />
                  Create Ticket
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/doctor/tickets")}
                  className="px-6 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200"
                  style={{
                    borderColor: THEME.primary,
                    color: THEME.primary,
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorNewTicketPage;
