// Simple error class for doctor children service
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface DoctorChild {
  id: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  grade: string;
  gender: string;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentAddress: string;
  problem: string; // Medical condition or problem
  schoolId: number | null;
  isEnrolledInSchool: boolean;
}

class DoctorChildrenService {
  private baseUrl = "http://188.166.197.135:8082/api/parents"; // Parent service URL

  // Get all children assigned to a specific doctor
  async getChildrenByDoctor(doctorId: number): Promise<DoctorChild[]> {
    try {
      const response = await this.makeAuthenticatedDoctorRequest(
        `${this.baseUrl}/doctors/${doctorId}/children`
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HTTP error! status: ${response.status}, response: ${errorText}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Response is not JSON:", responseText);
        throw new Error("Response is not JSON");
      }

      const children = await response.json();

      // Transform the data to match our frontend interface
      return children.map((child: any) => ({
        id: child.id,
        name: child.name,
        age: child.age || this.calculateAge(child.dateOfBirth),
        height: child.height || 0,
        weight: child.weight || 0,
        grade: child.grade || "Not Assigned",
        gender: child.gender || "Unknown",
        dateOfBirth: child.dateOfBirth,
        parentName: child.parentName || "Unknown",
        parentEmail: child.parentEmail || "Unknown",
        parentAddress: child.parentAddress || "Unknown",
        problem: child.problem || "No medical condition specified",
        schoolId: child.schoolId,
        isEnrolledInSchool: child.isEnrolledInSchool || false,
      }));
    } catch (error) {
      console.error("Error fetching children by doctor:", error);
      throw error;
    }
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  // Make authenticated request to parent service
  private async makeAuthenticatedDoctorRequest(url: string): Promise<Response> {
    const token = localStorage.getItem("doctorToken");

    if (!token) {
      throw new AuthError("No authentication token found");
    }

    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }
}

export const doctorChildrenService = new DoctorChildrenService();
