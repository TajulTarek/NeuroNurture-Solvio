package com.example.doctor.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctor.dto.PerformanceReportRequest;
import com.example.doctor.dto.PerformanceReportResponse;
import com.example.doctor.dto.ReportResponseRequest;
import com.example.doctor.service.ReportService;

@RestController
@RequestMapping("/api/doctor/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    /**
     * Parent sends a performance report to a doctor
     */
    @PostMapping("/send")
    public ResponseEntity<PerformanceReportResponse> sendReport(@RequestBody PerformanceReportRequest request) {
        try {
            PerformanceReportResponse response = reportService.createReport(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all pending reports for a doctor
     */
    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<List<PerformanceReportResponse>> getPendingReports(@PathVariable Long doctorId) {
        try {
            List<PerformanceReportResponse> reports = reportService.getPendingReportsForDoctor(doctorId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all reports for a doctor (both pending and reviewed)
     */
    @GetMapping("/doctor/{doctorId}/all")
    public ResponseEntity<List<PerformanceReportResponse>> getAllDoctorReports(@PathVariable Long doctorId) {
        try {
            List<PerformanceReportResponse> reports = reportService.getAllReportsForDoctor(doctorId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all reports for a child (for parent view)
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<PerformanceReportResponse>> getChildReports(@PathVariable Long childId) {
        try {
            List<PerformanceReportResponse> reports = reportService.getReportsForChild(childId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get a single report by ID
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<PerformanceReportResponse> getReport(@PathVariable Long reportId) {
        try {
            PerformanceReportResponse report = reportService.getReportById(reportId);
            if (report != null) {
                return ResponseEntity.ok(report);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Doctor responds to a report with verdict
     */
    @PutMapping("/{reportId}/respond")
    public ResponseEntity<PerformanceReportResponse> respondToReport(
            @PathVariable Long reportId,
            @RequestBody ReportResponseRequest request) {
        try {
            PerformanceReportResponse response = reportService.respondToReport(
                reportId, 
                request.getDoctorResponse(),
                request.getVerdict()
            );
            if (response != null) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get count of pending reports for a doctor
     */
    @GetMapping("/doctor/{doctorId}/pending/count")
    public ResponseEntity<Long> getPendingReportsCount(@PathVariable Long doctorId) {
        try {
            Long count = reportService.countPendingReports(doctorId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

