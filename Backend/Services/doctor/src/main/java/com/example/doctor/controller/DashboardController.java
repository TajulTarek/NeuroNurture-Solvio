package com.example.doctor.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.doctor.dto.PatientDetailsDto;

@RestController
@RequestMapping("/api/doctor/dashboard")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://188.166.197.135", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class DashboardController {
    
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082/api/parents";
    
    // Get dashboard statistics for a specific doctor
    @GetMapping("/stats/{doctorId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long doctorId) {
        logger.info("=== DOCTOR DASHBOARD STATS ===");
        logger.info("Fetching dashboard statistics for doctor ID: {}", doctorId);
        
        try {
            // Get patients for this doctor
            String patientsUrl = PARENT_SERVICE_URL + "/doctors/" + doctorId + "/children";
            logger.info("Calling parent service for patients: {}", patientsUrl);
            
            ResponseEntity<PatientDetailsDto[]> patientsResponse = restTemplate.getForEntity(patientsUrl, PatientDetailsDto[].class);
            
            if (patientsResponse.getStatusCode().is2xxSuccessful() && patientsResponse.getBody() != null) {
                List<PatientDetailsDto> patients = List.of(patientsResponse.getBody());
                
                // Calculate statistics
                int activePatients = patients.size();
                int totalTasks = 0; // TODO: Implement task counting
                int activeTasks = 0; // TODO: Implement active task counting
                int completedTasks = 0; // TODO: Implement completed task counting
                double averageProgress = 0.0; // TODO: Calculate from game performance data
                
                // Calculate average progress from patients (if available)
                if (!patients.isEmpty()) {
                    // For now, use a placeholder calculation
                    // In the future, this should be calculated from actual game performance data
                    averageProgress = 75.0; // Placeholder
                }
                
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalPatients", patients.size());
                stats.put("activePatients", activePatients);
                stats.put("totalTasks", totalTasks);
                stats.put("activeTasks", activeTasks);
                stats.put("completedTasks", completedTasks);
                stats.put("averageProgress", Math.round(averageProgress));
                stats.put("totalSessions", 0); // TODO: Implement session counting
                
                logger.info("✅ Dashboard statistics calculated successfully");
                logger.info("Active patients: {}, Average progress: {}%", activePatients, Math.round(averageProgress));
                
                return ResponseEntity.ok(stats);
            } else {
                logger.warn("❌ Parent service returned non-2xx status or null body");
                return ResponseEntity.status(404).body(createEmptyStats());
            }
        } catch (Exception e) {
            logger.error("❌ Error fetching dashboard statistics: {}", e.getMessage());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(500).body(createEmptyStats());
        }
    }
    
    private Map<String, Object> createEmptyStats() {
        Map<String, Object> emptyStats = new HashMap<>();
        emptyStats.put("totalPatients", 0);
        emptyStats.put("activePatients", 0);
        emptyStats.put("totalTasks", 0);
        emptyStats.put("activeTasks", 0);
        emptyStats.put("completedTasks", 0);
        emptyStats.put("averageProgress", 0);
        emptyStats.put("totalSessions", 0);
        return emptyStats;
    }
}
