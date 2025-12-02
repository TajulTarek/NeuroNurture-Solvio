package com.example.doctor.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.doctor.dto.PerformanceReportRequest;
import com.example.doctor.dto.PerformanceReportResponse;
import com.example.doctor.entity.Doctor;
import com.example.doctor.entity.PerformanceReport;
import com.example.doctor.repository.DoctorRepository;
import com.example.doctor.repository.PerformanceReportRepository;

@Service
public class ReportService {
    
    @Autowired
    private PerformanceReportRepository reportRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082/api/parents";
    
    /**
     * Create a new performance report
     */
    public PerformanceReportResponse createReport(PerformanceReportRequest request) {
        PerformanceReport report = new PerformanceReport();
        report.setChildId(request.getChildId());
        report.setChildName(request.getChildName());
        report.setParentId(request.getParentId());
        report.setParentName(request.getParentName());
        report.setDoctorId(request.getDoctorId());
        report.setSelectedGames(request.getSelectedGames());
        report.setGameSessionsData(request.getGameSessionsData());
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());
        
        PerformanceReport savedReport = reportRepository.save(report);
        return convertToResponse(savedReport);
    }
    
    /**
     * Get all pending reports for a doctor
     */
    public List<PerformanceReportResponse> getPendingReportsForDoctor(Long doctorId) {
        List<PerformanceReport> reports = reportRepository.findByDoctorIdAndStatusOrderByCreatedAtDesc(doctorId, "PENDING");
        return reports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all reports for a doctor (both pending and reviewed)
     */
    public List<PerformanceReportResponse> getAllReportsForDoctor(Long doctorId) {
        List<PerformanceReport> reports = reportRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        return reports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all reports for a child
     */
    public List<PerformanceReportResponse> getReportsForChild(Long childId) {
        List<PerformanceReport> reports = reportRepository.findByChildIdOrderByCreatedAtDesc(childId);
        return reports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a single report by ID
     */
    public PerformanceReportResponse getReportById(Long reportId) {
        Optional<PerformanceReport> reportOpt = reportRepository.findById(reportId);
        return reportOpt.map(this::convertToResponse).orElse(null);
    }
    
    /**
     * Doctor responds to a report with verdict
     */
    public PerformanceReportResponse respondToReport(Long reportId, String doctorResponse, String verdict) {
        Optional<PerformanceReport> reportOpt = reportRepository.findById(reportId);
        if (reportOpt.isPresent()) {
            PerformanceReport report = reportOpt.get();
            report.setDoctorResponse(doctorResponse);
            report.setVerdict(verdict); // SCREENING_NEEDED, NOT_NEEDED, INCONCLUSIVE
            report.setStatus("REVIEWED");
            report.setReviewedAt(LocalDateTime.now());
            
            PerformanceReport savedReport = reportRepository.save(report);
            PerformanceReportResponse response = convertToResponse(savedReport);
            
            // Send email notification to parent
            try {
                sendReportReviewNotification(savedReport, response.getDoctorName());
            } catch (Exception e) {
                // Log error but don't fail the response
                System.err.println("Failed to send email notification: " + e.getMessage());
                e.printStackTrace();
            }
            
            return response;
        }
        return null;
    }
    
    /**
     * Send email notification to parent when doctor reviews the report
     */
    @SuppressWarnings("unchecked")
    private void sendReportReviewNotification(PerformanceReport report, String doctorName) {
        try {
            // Get parent email from parent service
            String parentUrl = PARENT_SERVICE_URL + "/" + report.getParentId();
            Map<String, Object> parent = restTemplate.getForObject(parentUrl, Map.class);
            
            if (parent != null && parent.get("email") != null) {
                String parentEmail = (String) parent.get("email");
                String parentName = report.getParentName() != null ? report.getParentName() : "Parent";
                String childName = report.getChildName();
                String doctorResponse = report.getDoctorResponse();
                String verdict = report.getVerdict();
                
                emailService.sendReportReviewNotification(
                    parentEmail,
                    parentName,
                    childName,
                    doctorName,
                    doctorResponse,
                    verdict
                );
                
                System.out.println("Report review notification email sent to: " + parentEmail);
            } else {
                System.err.println("Parent email not found for parentId: " + report.getParentId());
            }
        } catch (Exception e) {
            System.err.println("Error fetching parent email or sending notification: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Count pending reports for a doctor
     */
    public Long countPendingReports(Long doctorId) {
        return reportRepository.countByDoctorIdAndStatus(doctorId, "PENDING");
    }
    
    /**
     * Convert entity to response DTO
     */
    private PerformanceReportResponse convertToResponse(PerformanceReport report) {
        PerformanceReportResponse response = new PerformanceReportResponse();
        response.setId(report.getId());
        response.setChildId(report.getChildId());
        response.setChildName(report.getChildName());
        response.setParentId(report.getParentId());
        response.setParentName(report.getParentName());
        response.setDoctorId(report.getDoctorId());
        response.setSelectedGames(report.getSelectedGames());
        response.setGameSessionsData(report.getGameSessionsData());
        response.setStatus(report.getStatus());
        response.setDoctorResponse(report.getDoctorResponse());
        response.setVerdict(report.getVerdict());
        response.setCreatedAt(report.getCreatedAt());
        response.setReviewedAt(report.getReviewedAt());
        
        // Get doctor name
        Optional<Doctor> doctorOpt = doctorRepository.findById(report.getDoctorId());
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            response.setDoctorName("Dr. " + doctor.getFirstName() + " " + doctor.getLastName());
        }
        
        return response;
    }
}

