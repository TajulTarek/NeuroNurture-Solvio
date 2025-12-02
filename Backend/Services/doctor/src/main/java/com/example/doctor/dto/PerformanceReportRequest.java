package com.example.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReportRequest {
    private Long childId;
    private String childName;
    private Long parentId;
    private String parentName;
    private Long doctorId;
    private String selectedGames;     // JSON array of game types e.g. ["gaze", "gesture", "dance"]
    private String gameSessionsData;  // JSON containing last 3 sessions per game
}

