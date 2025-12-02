// Doctor Dashboard Service
// Handles API calls for doctor dashboard statistics

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  averageProgress: number;
  totalSessions: number;
}

const API_BASE_URL = "http://188.166.197.135:8093"; // Doctor service URL (direct)

export class DoctorDashboardService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("doctorToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Fetch dashboard statistics for the current doctor
   */
  static async getDashboardStats(doctorId: string): Promise<DashboardStats> {
    try {
      console.log("Fetching dashboard stats for doctor ID:", doctorId);

      const response = await fetch(
        `${API_BASE_URL}/api/doctor/dashboard/stats/${doctorId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats = await response.json();
      console.log("Dashboard stats received:", stats);

      return {
        totalPatients: stats.totalPatients || 0,
        activePatients: stats.activePatients || 0,
        totalTasks: stats.totalTasks || 0,
        activeTasks: stats.activeTasks || 0,
        completedTasks: stats.completedTasks || 0,
        averageProgress: stats.averageProgress || 0,
        totalSessions: stats.totalSessions || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);

      // Return empty stats on error
      return {
        totalPatients: 0,
        activePatients: 0,
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        averageProgress: 0,
        totalSessions: 0,
      };
    }
  }

  /**
   * Get patients for the current doctor
   */
  static async getPatients(doctorId: string) {
    try {
      console.log("Fetching patients for doctor ID:", doctorId);

      const response = await fetch(
        `${API_BASE_URL}/api/doctor/patients/${doctorId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const patients = await response.json();
      console.log("Patients received:", patients);

      return patients;
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  }
}
