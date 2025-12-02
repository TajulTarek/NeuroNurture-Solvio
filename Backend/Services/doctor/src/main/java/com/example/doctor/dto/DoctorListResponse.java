package com.example.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorListResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String specialization;
    private String hospital;
    private String email;
    private Integer yearsOfExperience;
}

