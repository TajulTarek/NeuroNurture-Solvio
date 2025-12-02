package com.example.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseRequest {
    private String doctorResponse;
    private String verdict; // SCREENING_NEEDED, NOT_NEEDED, INCONCLUSIVE
}

