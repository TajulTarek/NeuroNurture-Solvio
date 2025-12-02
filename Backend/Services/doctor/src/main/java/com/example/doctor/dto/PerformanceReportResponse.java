package com.example.doctor.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReportResponse {
    private Long id;
    private Long childId;
    private String childName;
    private Long parentId;
    private String parentName;
    private Long doctorId;
    private String doctorName;
    private String selectedGames;
    private String gameSessionsData;
    private String status;
    private String doctorResponse;
    private String verdict; // SCREENING_NEEDED, NOT_NEEDED, INCONCLUSIVE
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}

