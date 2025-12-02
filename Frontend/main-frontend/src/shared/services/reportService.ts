// Report Service for sending performance reports to doctors

export interface PerformanceReportRequest {
  childId: number;
  childName: string;
  parentId: number;
  parentName: string;
  doctorId: number;
  selectedGames: string; // JSON array of game types
  gameSessionsData: string; // JSON containing last 3 sessions per game
}

export interface PerformanceReportResponse {
  id: number;
  childId: number;
  childName: string;
  parentId: number;
  parentName: string;
  doctorId: number;
  doctorName: string;
  selectedGames: string;
  gameSessionsData: string;
  status: 'PENDING' | 'REVIEWED';
  doctorResponse: string | null;
  verdict: 'SCREENING_NEEDED' | 'NOT_NEEDED' | 'INCONCLUSIVE' | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface DoctorListItem {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  hospital: string;
  email: string;
  yearsOfExperience: number;
}

export interface GameSessionData {
  gameType: string;
  gameName: string;
  sessions: any[];
}

class ReportService {
  private baseUrl = 'http://localhost:8093/api/doctor';

  /**
   * Send a performance report to a doctor
   */
  async sendReport(request: PerformanceReportRequest): Promise<PerformanceReportResponse> {
    const response = await fetch(`${this.baseUrl}/reports/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send report');
    }

    return response.json();
  }

  /**
   * Get all reports for a child (for parent view)
   */
  async getChildReports(childId: number): Promise<PerformanceReportResponse[]> {
    const response = await fetch(`${this.baseUrl}/reports/child/${childId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch child reports');
    }

    return response.json();
  }

  /**
   * Get pending reports for a doctor
   */
  async getPendingReports(doctorId: number): Promise<PerformanceReportResponse[]> {
    const response = await fetch(`${this.baseUrl}/reports/doctor/${doctorId}/pending`);

    if (!response.ok) {
      throw new Error('Failed to fetch pending reports');
    }

    return response.json();
  }

  /**
   * Get all reports for a doctor (both pending and reviewed)
   */
  async getAllDoctorReports(doctorId: number): Promise<PerformanceReportResponse[]> {
    const response = await fetch(`${this.baseUrl}/reports/doctor/${doctorId}/all`);

    if (!response.ok) {
      throw new Error('Failed to fetch doctor reports');
    }

    return response.json();
  }

  /**
   * Get a single report by ID
   */
  async getReport(reportId: number): Promise<PerformanceReportResponse> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }

    return response.json();
  }

  /**
   * Doctor responds to a report with verdict
   */
  async respondToReport(
    reportId: number, 
    doctorResponse: string, 
    verdict: 'SCREENING_NEEDED' | 'NOT_NEEDED' | 'INCONCLUSIVE'
  ): Promise<PerformanceReportResponse> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doctorResponse, verdict }),
    });

    if (!response.ok) {
      throw new Error('Failed to respond to report');
    }

    return response.json();
  }

  /**
   * Get count of pending reports for a doctor
   */
  async getPendingReportsCount(doctorId: number): Promise<number> {
    const response = await fetch(`${this.baseUrl}/reports/doctor/${doctorId}/pending/count`);

    if (!response.ok) {
      throw new Error('Failed to fetch pending reports count');
    }

    return response.json();
  }

  /**
   * Get list of verified doctors (for parent selection)
   */
  async getVerifiedDoctors(): Promise<DoctorListItem[]> {
    const response = await fetch(`${this.baseUrl}/admin/verified`);

    if (!response.ok) {
      throw new Error('Failed to fetch verified doctors');
    }

    return response.json();
  }

  /**
   * Fetch last 3 sessions for selected games
   */
  async fetchGameSessions(childId: string, selectedGames: string[]): Promise<GameSessionData[]> {
    const gameUrls: { [key: string]: { url: string; name: string } } = {
      gaze: { url: `http://localhost:8086/api/gaze-game/child/${childId}`, name: 'Gaze Game' },
      gesture: { url: `http://localhost:8084/api/gesture-game/child/${childId}`, name: 'Gesture Game' },
      dance: { url: `http://localhost:8087/api/dance-doodle/child/${childId}`, name: 'Dance Doodle' },
      mirror: { url: `http://localhost:8083/api/mirror-posture-game/child/${childId}`, name: 'Mirror Posture' },
      repeat: { url: `http://localhost:8089/api/repeat-with-me-game/child/${childId}`, name: 'Repeat With Me' },
    };

    const gameSessionsData: GameSessionData[] = [];

    for (const gameType of selectedGames) {
      const gameInfo = gameUrls[gameType];
      if (gameInfo) {
        try {
          const response = await fetch(gameInfo.url);
          if (response.ok) {
            const allSessions = await response.json();
            // Get last 3 sessions (sorted by dateTime desc)
            const sortedSessions = allSessions
              .sort((a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
              .slice(0, 3);
            
            gameSessionsData.push({
              gameType,
              gameName: gameInfo.name,
              sessions: sortedSessions,
            });
          }
        } catch (error) {
          console.error(`Error fetching ${gameType} sessions:`, error);
        }
      }
    }

    return gameSessionsData;
  }
}

export const reportService = new ReportService();

