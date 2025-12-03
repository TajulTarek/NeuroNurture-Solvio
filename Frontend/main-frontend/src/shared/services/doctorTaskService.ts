// Simple error class for doctor task service
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface DoctorTaskCreateRequest {
  taskTitle: string;
  taskDescription: string;
  startTime: string;
  endTime: string;
  childIds: number[];
  selectedGames: string[];
}

export interface DoctorTaskResponse {
  taskId: number;
  doctorId: number;
  childId?: number;
  childName?: string;
  gameId: number;
  selectedGames: string[];
  taskTitle: string;
  taskDescription: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedChildren?: ChildAssignment[];
  totalAssigned?: number;
  completedCount?: number;
}

export interface ChildAssignment {
  childId: number;
  childName: string;
  status: string;
  lastUpdated: string;
}

const API_BASE_URL = "https://neronurture.app:18093"; // Doctor service URL (direct)

export class DoctorTaskService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("doctorToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async createTasks(
    request: DoctorTaskCreateRequest,
    doctorId: number
  ): Promise<DoctorTaskResponse[]> {
    const url = `${API_BASE_URL}/api/doctor/tasks/create?doctorId=${doctorId}`;
    console.log(`Creating doctor tasks for doctor ${doctorId}:`, request);

    const headers = DoctorTaskService.getAuthHeaders();
    console.log("Request headers:", headers);
    console.log(
      "JWT Token:",
      localStorage.getItem("doctorToken") ? "Present" : "Missing"
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: DoctorTaskResponse[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating doctor tasks:", error);
      throw new AuthError("Failed to create tasks");
    }
  }

  static async getTasksByDoctor(
    doctorId: string
  ): Promise<DoctorTaskResponse[]> {
    const url = `${API_BASE_URL}/api/doctor/tasks/doctor/${doctorId}`;
    console.log(`Fetching doctor tasks from: ${url}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: DoctorTaskService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: DoctorTaskResponse[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching doctor tasks:", error);
      throw new AuthError("Failed to fetch tasks");
    }
  }

  static async getTasksByChild(childId: string): Promise<DoctorTaskResponse[]> {
    const url = `${API_BASE_URL}/api/doctor/tasks/child/${childId}`;
    console.log(`Fetching child tasks from: ${url}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: DoctorTaskService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: DoctorTaskResponse[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching child tasks:", error);
      throw new AuthError("Failed to fetch child tasks");
    }
  }

  static async updateTaskStatus(
    taskId: string,
    status: string
  ): Promise<DoctorTaskResponse> {
    const url = `${API_BASE_URL}/api/doctor/tasks/${taskId}/status`;
    console.log(`Updating task status: ${taskId} to ${status}`);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: DoctorTaskService.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: DoctorTaskResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating task status:", error);
      throw new AuthError("Failed to update task status");
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/doctor/tasks/${taskId}`;
    console.log(`Deleting task: ${taskId}`);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: DoctorTaskService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new AuthError("Failed to delete task");
    }
  }

  static async getTaskDetails(taskId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/doctor/tasks/${taskId}/details`;
    console.log(`Fetching task details from: ${url}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: DoctorTaskService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching task details:", error);
      throw new AuthError("Failed to fetch task details");
    }
  }
}
