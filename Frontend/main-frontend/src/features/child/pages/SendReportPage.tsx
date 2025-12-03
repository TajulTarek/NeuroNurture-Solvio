import DashboardNavbar from "@/components/common/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorListItem, reportService } from "@/shared/services/reportService";
import { getCurrentChild } from "@/shared/utils/childUtils";
import { performLogout } from "@/shared/utils/logoutUtils";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  FileText,
  Gamepad2,
  Loader2,
  Mail,
  Search,
  Send,
  Stethoscope,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ParentInfo {
  id: number;
  name: string;
}

const GAMES = [
  {
    id: "gaze",
    name: "Gaze Game",
    description: "Eye tracking and attention assessment",
    icon: "👁️",
  },
  {
    id: "gesture",
    name: "Gesture Game",
    description: "Hand gesture recognition",
    icon: "🤚",
  },
  {
    id: "dance",
    name: "Dance Doodle",
    description: "Body movement and coordination",
    icon: "💃",
  },
  {
    id: "mirror",
    name: "Mirror Posture",
    description: "Facial expression mirroring",
    icon: "🪞",
  },
  {
    id: "repeat",
    name: "Repeat With Me",
    description: "Speech and language assessment",
    icon: "🎤",
  },
];

export default function SendReportPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "playground" | "school" | "doctor"
  >("doctor");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState<DoctorListItem[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] =
    useState<string>("all");
  const [hospitalFilter, setHospitalFilter] = useState<string>("all");

  // Child and parent data
  const [child, setChild] = useState<any>(null);
  const [parent, setParent] = useState<ParentInfo | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true);

      // Get child from localStorage
      const childData = getCurrentChild();
      setChild(childData);

      // Fetch parent info from API
      const emailResponse = await fetch(
        "https://neronurture.app:18080/auth/me",
        {
          credentials: "include",
        }
      );

      if (emailResponse.ok) {
        const email = await emailResponse.text();
        const parentResponse = await fetch(
          `https://neronurture.app:18082/api/parents/by-email/${email}`,
          {
            credentials: "include",
          }
        );

        if (parentResponse.ok) {
          const parentData = await parentResponse.json();
          setParent({
            id: parentData.id,
            name: parentData.name || parentData.username || "Parent",
          });
        }
      }

      // Load doctors
      await loadVerifiedDoctors();
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadVerifiedDoctors = async () => {
    try {
      setIsLoadingDoctors(true);
      const doctors = await reportService.getVerifiedDoctors();
      setVerifiedDoctors(doctors);
    } catch (err) {
      console.error("Error loading doctors:", err);
      setError("Failed to load doctors list");
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleLogout = async () => {
    await performLogout();
  };

  const handleTabChange = (tab: "playground" | "school" | "doctor") => {
    setActiveTab(tab);
    navigate("/dashboard");
  };

  // Get unique specializations and hospitals for filters
  const specializations = useMemo(() => {
    const specs = [
      ...new Set(verifiedDoctors.map((d) => d.specialization).filter(Boolean)),
    ];
    return specs.sort();
  }, [verifiedDoctors]);

  const hospitals = useMemo(() => {
    const hosps = [
      ...new Set(verifiedDoctors.map((d) => d.hospital).filter(Boolean)),
    ];
    return hosps.sort();
  }, [verifiedDoctors]);

  // Filter doctors based on search and filters
  const filteredDoctors = useMemo(() => {
    return verifiedDoctors.filter((doctor) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        `${doctor.firstName} ${doctor.lastName}`
          .toLowerCase()
          .includes(searchLower) ||
        doctor.specialization?.toLowerCase().includes(searchLower) ||
        doctor.hospital?.toLowerCase().includes(searchLower);

      const matchesSpecialization =
        specializationFilter === "all" ||
        doctor.specialization === specializationFilter;

      const matchesHospital =
        hospitalFilter === "all" || doctor.hospital === hospitalFilter;

      return matchesSearch && matchesSpecialization && matchesHospital;
    });
  }, [verifiedDoctors, searchQuery, specializationFilter, hospitalFilter]);

  const handleGameToggle = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAllGames = () => {
    if (selectedGames.length === GAMES.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(GAMES.map((g) => g.id));
    }
  };

  const handleSendReport = async () => {
    if (!child || !parent) {
      setError("Child or parent data not found");
      return;
    }

    if (selectedGames.length === 0) {
      setError("Please select at least one game");
      return;
    }

    if (!selectedDoctorId) {
      setError("Please select a doctor");
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const gameSessionsData = await reportService.fetchGameSessions(
        child.id.toString(),
        selectedGames
      );

      await reportService.sendReport({
        childId: child.id,
        childName: child.name,
        parentId: parent.id,
        parentName: parent.name,
        doctorId: selectedDoctorId,
        selectedGames: JSON.stringify(selectedGames),
        gameSessionsData: JSON.stringify(gameSessionsData),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error sending report:", err);
      setError("Failed to send report. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const selectedDoctor = verifiedDoctors.find((d) => d.id === selectedDoctorId);

  // Show loading state while fetching initial data
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-soft font-nunito custom-scrollbar relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 via-orange-50 to-red-50 opacity-20"></div>
        </div>

        <DashboardNavbar
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="flex items-center justify-center min-h-screen pt-20 relative z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">Preparing report form</p>
          </div>
        </div>
      </div>
    );
  }

  if (!child || !parent) {
    return (
      <div className="min-h-screen bg-soft font-nunito custom-scrollbar relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 via-orange-50 to-red-50 opacity-20"></div>
        </div>

        <DashboardNavbar
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="flex items-center justify-center min-h-screen pt-20 relative z-10">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Data Not Found
            </h2>
            <p className="text-gray-600 mb-4">Please select a child first.</p>
            <Button
              onClick={() => navigate("/children")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Select a Child
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft font-nunito custom-scrollbar relative overflow-hidden">
      {/* Subtle Background Elements - Same as Dashboard */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 via-orange-50 to-red-50 opacity-20"></div>

        {/* Floating Bubbles */}
        <div
          className="absolute top-1/4 left-1/6 w-4 h-4 bg-blue-300 rounded-full animate-float opacity-60"
          style={{ animationDelay: "0s", animationDuration: "6s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/5 w-6 h-6 bg-purple-300 rounded-full animate-float opacity-50"
          style={{ animationDelay: "2s", animationDuration: "7s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-3 h-3 bg-pink-300 rounded-full animate-float opacity-70"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/3 w-5 h-5 bg-yellow-300 rounded-full animate-float opacity-60"
          style={{ animationDelay: "3s", animationDuration: "8s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/5 w-4 h-4 bg-green-300 rounded-full animate-float opacity-50"
          style={{ animationDelay: "1.5s", animationDuration: "6.5s" }}
        ></div>

        {/* Rainbow Trail Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-purple-400 to-pink-400 opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 via-yellow-400 to-red-400 opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Dashboard Navbar */}
      <DashboardNavbar
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 relative z-10">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Send Performance Report
              </h1>
              <p className="text-gray-600">for {child.name}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Report sent successfully!
              </p>
              <p className="text-sm text-green-600">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold text-xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Game Selection */}
          <Card className="shadow-lg border-2 border-purple-100 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Select Games
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllGames}
                  className="text-xs border-purple-200 hover:bg-purple-50"
                >
                  {selectedGames.length === GAMES.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Last 3 sessions from each selected game will be included in the
                report.
              </p>

              <div className="space-y-3">
                {GAMES.map((game) => (
                  <div
                    key={game.id}
                    className={`cursor-pointer transition-all rounded-xl border-2 p-4 flex items-center space-x-4 ${
                      selectedGames.includes(game.id)
                        ? "border-purple-400 bg-purple-50 shadow-md"
                        : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
                    }`}
                    onClick={() => handleGameToggle(game.id)}
                  >
                    <Checkbox
                      checked={selectedGames.includes(game.id)}
                      onCheckedChange={() => handleGameToggle(game.id)}
                      className="data-[state=checked]:bg-purple-600"
                    />
                    <span className="text-2xl">{game.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {game.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {game.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedGames.length > 0 && (
                <div className="mt-4 p-3 bg-purple-100 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">
                    ✨ <span className="font-bold">{selectedGames.length}</span>{" "}
                    game(s) selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Doctor Selection */}
          <Card className="shadow-lg border-2 border-blue-100 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Select Doctor
                </h2>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, specialization, or hospital..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">
                      Specialization
                    </Label>
                    <Select
                      value={specializationFilter}
                      onValueChange={setSpecializationFilter}
                    >
                      <SelectTrigger className="h-9 border-blue-200">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">
                      Hospital
                    </Label>
                    <Select
                      value={hospitalFilter}
                      onValueChange={setHospitalFilter}
                    >
                      <SelectTrigger className="h-9 border-blue-200">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Hospitals</SelectItem>
                        {hospitals.map((hosp) => (
                          <SelectItem key={hosp} value={hosp}>
                            {hosp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Doctor List */}
              {isLoadingDoctors ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-500">Loading doctors...</span>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {verifiedDoctors.length === 0
                      ? "No verified doctors available"
                      : "No doctors match your search criteria"}
                  </p>
                  {(searchQuery ||
                    specializationFilter !== "all" ||
                    hospitalFilter !== "all") && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSpecializationFilter("all");
                        setHospitalFilter("all");
                      }}
                      className="mt-2 text-blue-600"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Showing {filteredDoctors.length} of {verifiedDoctors.length}{" "}
                    doctors
                  </p>
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`cursor-pointer transition-all rounded-xl border-2 p-4 ${
                        selectedDoctorId === doctor.id
                          ? "border-blue-400 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                      onClick={() => setSelectedDoctorId(doctor.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h4>
                            {selectedDoctorId === doctor.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-blue-600 font-medium">
                            {doctor.specialization}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Building2 className="w-3 h-3 mr-1.5" />
                              <span className="truncate">
                                {doctor.hospital}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1.5" />
                              <span>
                                {doctor.yearsOfExperience} years experience
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Mail className="w-3 h-3 mr-1.5" />
                              <span className="truncate">{doctor.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary and Send Button */}
        <Card className="mt-6 shadow-lg border-2 border-green-100 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📋</span> Report Summary
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <User className="w-4 h-4 mr-1.5 text-gray-500" />
                    <span>
                      Child: <span className="font-medium">{child.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                    <Gamepad2 className="w-4 h-4 mr-1.5 text-purple-500" />
                    <span className="font-medium text-purple-700">
                      {selectedGames.length} game
                      {selectedGames.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                    <Stethoscope className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium text-blue-700">
                      {selectedDoctor
                        ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                        : "No doctor selected"}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSendReport}
                disabled={
                  isSending ||
                  selectedGames.length === 0 ||
                  !selectedDoctorId ||
                  success
                }
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-w-[180px] shadow-lg"
                size="lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
