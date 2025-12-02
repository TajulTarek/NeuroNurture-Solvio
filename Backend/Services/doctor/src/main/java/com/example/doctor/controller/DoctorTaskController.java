package com.example.doctor.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctor.dto.DoctorTaskCreateRequest;
import com.example.doctor.dto.DoctorTaskResponse;
import com.example.doctor.service.DoctorTaskService;

@RestController
@RequestMapping("/api/doctor/tasks")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://188.166.197.135", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class DoctorTaskController {
    
    @Autowired
    private DoctorTaskService taskService;
    
    /**
     * Create new tasks for multiple children
     */
    @PostMapping("/create")
    public ResponseEntity<List<DoctorTaskResponse>> createTasks(
            @RequestBody DoctorTaskCreateRequest request,
            @RequestParam Long doctorId) {
        try {
            List<DoctorTaskResponse> tasks = taskService.createTasks(request, doctorId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all tasks for a doctor
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorTaskResponse>> getTasksByDoctor(@PathVariable Long doctorId) {
        try {
            List<DoctorTaskResponse> tasks = taskService.getTasksByDoctor(doctorId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tasks for a specific child
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<DoctorTaskResponse>> getTasksByChild(@PathVariable Long childId) {
        try {
            List<DoctorTaskResponse> tasks = taskService.getTasksByChild(childId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tasks by doctor and child
     */
    @GetMapping("/doctor/{doctorId}/child/{childId}")
    public ResponseEntity<List<DoctorTaskResponse>> getTasksByDoctorAndChild(@PathVariable Long doctorId, @PathVariable Long childId) {
        try {
            List<DoctorTaskResponse> tasks = taskService.getTasksByDoctorAndChild(doctorId, childId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update task status
     */
    @PutMapping("/{taskId}/status")
    public ResponseEntity<DoctorTaskResponse> updateTaskStatus(@PathVariable Long taskId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            DoctorTaskResponse updatedTask = taskService.updateTaskStatus(taskId, status);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete a task by task_id
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get task details
     */
    @GetMapping("/{taskId}/details")
    public ResponseEntity<Map<String, Object>> getTaskDetails(@PathVariable Long taskId, @RequestParam Long doctorId) {
        try {
            Map<String, Object> taskDetails = taskService.getTaskDetails(taskId, doctorId);
            return ResponseEntity.ok(taskDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
