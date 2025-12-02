package com.example.doctor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.doctor.entity.PerformanceReport;

@Repository
public interface PerformanceReportRepository extends JpaRepository<PerformanceReport, Long> {
    
    // Find all reports for a specific doctor
    List<PerformanceReport> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    
    // Find pending reports for a specific doctor
    List<PerformanceReport> findByDoctorIdAndStatusOrderByCreatedAtDesc(Long doctorId, String status);
    
    // Find all reports for a specific child
    List<PerformanceReport> findByChildIdOrderByCreatedAtDesc(Long childId);
    
    // Find reports by child and doctor
    List<PerformanceReport> findByChildIdAndDoctorIdOrderByCreatedAtDesc(Long childId, Long doctorId);
    
    // Count pending reports for a doctor
    Long countByDoctorIdAndStatus(Long doctorId, String status);
}

