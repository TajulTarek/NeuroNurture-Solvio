import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Gamepad2,
  Heart,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HealthTask {
  id: number;
  title: string;
  description: string;
  type: "exercise" | "medication" | "assessment" | "therapy";
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  priority: "low" | "medium" | "high";
  doctor: string;
  instructions: string;
  completedAt?: string;
  selectedGames?: string[]; // Add games array
  startTime?: string; // Add start time
  endTime?: string; // Add end time
}

export default function ChildDoctorTaskPage({
  childId,
  childName,
}: {
  childId: string;
  childName: string;
}) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<HealthTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");

  useEffect(() => {
    loadHealthTasks();
  }, [childId]);

  const loadHealthTasks = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching doctor tasks for child ID:", childId);

      const response = await fetch(
        `http://188.166.197.135:8093/api/doctor/tasks/child/${childId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const doctorTasks = await response.json();
      console.log("Doctor tasks received:", doctorTasks);

      // Transform doctor tasks to HealthTask format
      const healthTasks: HealthTask[] = doctorTasks.map((task: any) => ({
        id: task.taskId,
        title: task.taskTitle,
        description: task.taskDescription,
        type: "therapy", // Default type for doctor tasks
        status: task.status.toLowerCase(),
        dueDate: task.endTime.split("T")[0], // Extract date from datetime
        priority: "medium", // Default priority
        doctor: "Dr. Smith", // TODO: Get actual doctor name
        instructions: task.taskDescription,
        completedAt: task.status === "COMPLETED" ? task.updatedAt : undefined,
        selectedGames: task.selectedGames || [], // Add games array
        startTime: task.startTime,
        endTime: task.endTime,
      }));

      setTasks(healthTasks);
    } catch (error) {
      console.error("Error loading health tasks:", error);
      // Set empty array on error to show no tasks message
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markTaskAsCompleted = async (taskId: number) => {
    try {
      console.log("Marking task as completed:", taskId);

      const response = await fetch(
        `http://188.166.197.135:8093/api/doctor/tasks/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "COMPLETED" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh tasks after status update
      await loadHealthTasks();
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  const handleGameClick = (gameName: string, taskId: number) => {
    // Map game names to their respective routes based on App.tsx
    const gameRoutes: { [key: string]: string } = {
      "Dance Doodle": "/games/dance-doodle",
      "Gaze Game": "/games/gaze-tracking",
      "Gesture Game": "/games/gesture",
      "Mirror Posture Game": "/games/mirror-posture",
      "Repeat With Me Game": "/games/repeat-with-me",
    };

    const gameRoute = gameRoutes[gameName];
    if (gameRoute) {
      // Navigate to the game with task ID as a query parameter
      navigate(`${gameRoute}?taskId=${taskId}&childId=${childId}`);
    } else {
      console.error(`Unknown game: ${gameName}`);
    }
  };

  const getGameIcon = (gameName: string) => {
    const gameIcons: { [key: string]: string } = {
      "Dance Doodle": "💃",
      "Gaze Game": "👁️",
      "Gesture Game": "✋",
      "Mirror Posture Game": "🪞",
      "Repeat With Me Game": "🔄",
    };
    return gameIcons[gameName] || "🎮";
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return <Activity className="h-5 w-5" />;
      case "medication":
        return <Heart className="h-5 w-5" />;
      case "assessment":
        return <Brain className="h-5 w-5" />;
      case "therapy":
        return <Eye className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📝</div>
          <h2 className="text-2xl font-playful text-primary mb-2">
            Loading Health Tasks...
          </h2>
          <p className="text-lg font-comic text-muted-foreground">
            Please wait while we fetch your tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playful text-primary mb-2 flex items-center justify-center">
          <span className="mr-2">📝</span>
          Health Tasks
        </h2>
        <p className="text-lg font-comic text-muted-foreground">
          {childName}'s health and wellness tasks from Dr. Johnson
        </p>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {taskStats.total}
            </div>
            <div className="text-sm text-blue-700">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {taskStats.completed}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {taskStats.pending}
            </div>
            <div className="text-sm text-yellow-700">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {taskStats.overdue}
            </div>
            <div className="text-sm text-red-700">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="font-comic"
        >
          All Tasks ({taskStats.total})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          className="font-comic"
        >
          Pending ({taskStats.pending})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          className="font-comic"
        >
          Completed ({taskStats.completed})
        </Button>
        <Button
          variant={filter === "overdue" ? "default" : "outline"}
          onClick={() => setFilter("overdue")}
          className="font-comic"
        >
          Overdue ({taskStats.overdue})
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="card-playful p-8 backdrop-blur-sm bg-white/80">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-playful text-xl text-primary mb-2">
                No Tasks Found
              </h3>
              <p className="font-comic text-lg text-muted-foreground">
                {filter === "all"
                  ? "No health tasks assigned yet."
                  : `No ${filter} tasks at the moment.`}
              </p>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const selectedGames = task.selectedGames || [];
            const now = new Date();
            const endTime = new Date(task.endTime || task.dueDate);
            const isEnded = now > endTime;
            const displayStatus = isEnded ? "Ended" : "Running";
            const statusColor = isEnded
              ? "text-gray-600 bg-gray-100"
              : "text-green-600 bg-green-100";
            const statusIcon = isEnded ? "🏁" : "🔄";

            return (
              <Card
                key={task.id}
                className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-200 relative overflow-hidden h-full flex flex-col"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 relative p-4 flex-shrink-0">
                  {/* Gamepad background pattern */}
                  <div className="absolute top-1 right-1 opacity-10">
                    <Gamepad2 className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 mb-1 font-bold line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-gray-700 text-sm line-clamp-2">
                        {task.description}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${statusColor} border-0 shadow-sm text-xs`}
                    >
                      <span className="mr-1">{statusIcon}</span>
                      {displayStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* Games - Compact Buttons */}
                    {selectedGames.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                          <Gamepad2 className="h-4 w-4 mr-1 text-blue-600" />
                          Games:
                        </h4>
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                          {selectedGames.slice(0, 3).map((game, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className={`group relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                                isEnded
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-gradient-to-r from-blue-500 to-blue-700 text-white border-blue-500 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg"
                              }`}
                              onClick={() =>
                                !isEnded && handleGameClick(game, task.id)
                              }
                              disabled={isEnded}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="text-sm">
                                  {getGameIcon(game)}
                                </span>
                                <span className="text-xs font-bold">
                                  {game.split(" ")[0]}
                                </span>
                                {!isEnded && (
                                  <Play className="h-3 w-3 opacity-80" />
                                )}
                              </div>
                              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Time Information - Compact */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-700">
                          <Calendar className="h-3 w-3 mr-2 text-blue-600" />
                          <span className="font-medium">
                            Start:{" "}
                            {new Date(
                              task.startTime || task.dueDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <Clock className="h-3 w-3 mr-2 text-blue-600" />
                          <span
                            className={`font-medium ${
                              isEnded ? "text-gray-500" : "text-gray-700"
                            }`}
                          >
                            End:{" "}
                            {new Date(
                              task.endTime || task.dueDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="flex gap-2 pt-3 mt-auto">
                    {!isEnded && task.status === "in_progress" && (
                      <Button
                        size="sm"
                        className="font-comic bg-green-600 hover:bg-green-700"
                        onClick={() => markTaskAsCompleted(task.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {task.status === "completed" && task.completedAt && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300"
                      >
                        Completed:{" "}
                        {new Date(task.completedAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <h3 className="font-playful text-xl text-primary mb-3">
            Quick Actions 🚀
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="font-comic">📊 View Progress Report</Button>
            <Button variant="outline" className="font-comic">
              💬 Message Doctor
            </Button>
            <Button variant="outline" className="font-comic">
              📅 Schedule Appointment
            </Button>
            <Button variant="outline" className="font-comic">
              📋 View Medical History
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
