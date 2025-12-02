package com.example.doctor.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.doctor.dto.DoctorTaskCreateRequest;
import com.example.doctor.dto.DoctorTaskResponse;
import com.example.doctor.entity.DoctorTask;
import com.example.doctor.repository.DoctorTaskRepository;

@Service
public class DoctorTaskService {
    
    @Autowired
    private DoctorTaskRepository taskRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082/api/parents";
    
    // Game mapping for bit operations (same as school service)
    private static final Map<String, Integer> GAME_BIT_MAPPING = new HashMap<>();
    static {
        GAME_BIT_MAPPING.put("Dance Doodle", 1);        // 0th bit (2^0 = 1)
        GAME_BIT_MAPPING.put("Gaze Game", 2);           // 1st bit (2^1 = 2)
        GAME_BIT_MAPPING.put("Gesture Game", 4);         // 2nd bit (2^2 = 4)
        GAME_BIT_MAPPING.put("Mirror Posture Game", 8);  // 3rd bit (2^3 = 8)
        GAME_BIT_MAPPING.put("Repeat With Me Game", 16); // 4th bit (2^4 = 16)
    }
    
    private static final Map<Integer, String> BIT_TO_GAME_MAPPING = new HashMap<>();
    static {
        BIT_TO_GAME_MAPPING.put(1, "Dance Doodle");
        BIT_TO_GAME_MAPPING.put(2, "Gaze Game");
        BIT_TO_GAME_MAPPING.put(4, "Gesture Game");
        BIT_TO_GAME_MAPPING.put(8, "Mirror Posture Game");
        BIT_TO_GAME_MAPPING.put(16, "Repeat With Me Game");
    }
    
    /**
     * Create tasks for multiple children
     */
    public List<DoctorTaskResponse> createTasks(DoctorTaskCreateRequest request, Long doctorId) {
        // Calculate game ID using bit mapping
        Integer gameId = calculateGameId(request.getSelectedGames());
        
        // Generate a unique task_id for this task assignment
        // Concatenate timestamp with doctor_id to ensure uniqueness across doctors
        Long taskId = Long.parseLong(System.currentTimeMillis() + "" + doctorId);
        
        List<DoctorTask> tasks = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Create a task for each child with the same task_id
        for (Long childId : request.getChildIds()) {
            DoctorTask task = new DoctorTask();
            task.setTaskId(taskId); // Same task_id for all children
            task.setDoctorId(doctorId);
            task.setChildId(childId);
            task.setGameId(gameId);
            task.setTaskTitle(request.getTaskTitle());
            task.setTaskDescription(request.getTaskDescription());
            task.setStartTime(request.getStartTime());
            task.setEndTime(request.getEndTime());
            task.setStatus("ASSIGNED");
            task.setCreatedAt(now);
            task.setUpdatedAt(now);
            
            tasks.add(task);
        }
        
        // Save all tasks
        List<DoctorTask> savedTasks = taskRepository.saveAll(tasks);
        
        // Group the saved tasks and return grouped response
        return groupTasksByContent(savedTasks);
    }
    
    /**
     * Get all tasks for a doctor (grouped by task content)
     */
    public List<DoctorTaskResponse> getTasksByDoctor(Long doctorId) {
        List<DoctorTask> tasks = taskRepository.findByDoctorId(doctorId);
        return groupTasksByContent(tasks);
    }
    
    /**
     * Get tasks for a specific child
     */
    public List<DoctorTaskResponse> getTasksByChild(Long childId) {
        List<DoctorTask> tasks = taskRepository.findByChildId(childId);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tasks by doctor and child
     */
    public List<DoctorTaskResponse> getTasksByDoctorAndChild(Long doctorId, Long childId) {
        List<DoctorTask> tasks = taskRepository.findByDoctorIdAndChildId(doctorId, childId);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Update task status
     */
    public DoctorTaskResponse updateTaskStatus(Long taskId, String status) {
        DoctorTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        
        DoctorTask updatedTask = taskRepository.save(task);
        return convertToTaskResponse(updatedTask);
    }
    
    /**
     * Delete a task by task_id (removes all entries for this task_id)
     */
    @Transactional
    public void deleteTask(Long taskId) {
        try {
            taskRepository.deleteByTaskId(taskId);
            System.err.println("Successfully deleted doctor task " + taskId);
        } catch (Exception e) {
            System.err.println("Error deleting doctor task " + taskId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete task", e);
        }
    }
    
    /**
     * Get task details including title, description, timeline, and statistics
     */
    public Map<String, Object> getTaskDetails(Long taskId, Long doctorId) {
        try {
            // Get all tasks for this task_id and doctor_id
            List<DoctorTask> doctorTasks = taskRepository.findByDoctorIdAndTaskId(doctorId, taskId);
            
            if (doctorTasks.isEmpty()) {
                throw new RuntimeException("Task not found");
            }
            
            // Get the first task to extract common details
            DoctorTask firstTask = doctorTasks.get(0);
            
            // Calculate statistics
            int totalAssigned = doctorTasks.size();
            int completedCount = (int) doctorTasks.stream()
                    .filter(task -> "COMPLETED".equals(task.getStatus()))
                    .count();
            
            // Determine task status based on current time
            String status = "active";
            if (completedCount == totalAssigned) {
                status = "completed";
            } else if (firstTask.getEndTime().isBefore(LocalDateTime.now())) {
                status = "expired";
            }
            
            // Get selected games
            List<String> selectedGames = getSelectedGamesFromGameId(firstTask.getGameId());
            
            // Build response
            Map<String, Object> taskDetails = new HashMap<>();
            taskDetails.put("taskId", firstTask.getTaskId());
            taskDetails.put("title", firstTask.getTaskTitle());
            taskDetails.put("description", firstTask.getTaskDescription());
            taskDetails.put("startDate", firstTask.getStartTime().toString());
            taskDetails.put("endDate", firstTask.getEndTime().toString());
            taskDetails.put("assignedDate", firstTask.getCreatedAt().toString());
            taskDetails.put("status", status);
            taskDetails.put("totalAssigned", totalAssigned);
            taskDetails.put("completedCount", completedCount);
            taskDetails.put("selectedGames", selectedGames);
            
            return taskDetails;
            
        } catch (Exception e) {
            System.err.println("Error getting doctor task details: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get task details", e);
        }
    }
    
    /**
     * Calculate game ID from selected games using bit mapping
     */
    private Integer calculateGameId(List<String> selectedGames) {
        int gameId = 0;
        for (String game : selectedGames) {
            Integer bitValue = GAME_BIT_MAPPING.get(game);
            if (bitValue != null) {
                gameId |= bitValue;
            }
        }
        return gameId;
    }
    
    /**
     * Get selected games from game ID using bit mapping
     */
    private List<String> getSelectedGamesFromGameId(Integer gameId) {
        List<String> selectedGames = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : BIT_TO_GAME_MAPPING.entrySet()) {
            if ((gameId & entry.getKey()) != 0) {
                selectedGames.add(entry.getValue());
            }
        }
        return selectedGames;
    }
    
    /**
     * Group tasks by content and return grouped response
     */
    private List<DoctorTaskResponse> groupTasksByContent(List<DoctorTask> tasks) {
        Map<Long, List<DoctorTask>> groupedTasks = tasks.stream()
                .collect(Collectors.groupingBy(DoctorTask::getTaskId));
        
        List<DoctorTaskResponse> responses = new ArrayList<>();
        
        for (Map.Entry<Long, List<DoctorTask>> entry : groupedTasks.entrySet()) {
            List<DoctorTask> taskGroup = entry.getValue();
            DoctorTask firstTask = taskGroup.get(0);
            
            // Get child names from parent service
            List<DoctorTaskResponse.ChildAssignment> assignedChildren = new ArrayList<>();
            for (DoctorTask task : taskGroup) {
                try {
                    String childName = getChildName(task.getChildId());
                    assignedChildren.add(new DoctorTaskResponse.ChildAssignment(
                            task.getChildId(),
                            childName,
                            task.getStatus(),
                            task.getUpdatedAt()
                    ));
                } catch (Exception e) {
                    System.err.println("Error getting child name for child ID " + task.getChildId() + ": " + e.getMessage());
                    assignedChildren.add(new DoctorTaskResponse.ChildAssignment(
                            task.getChildId(),
                            "Unknown Child",
                            task.getStatus(),
                            task.getUpdatedAt()
                    ));
                }
            }
            
            int completedCount = (int) taskGroup.stream()
                    .filter(task -> "COMPLETED".equals(task.getStatus()))
                    .count();
            
            DoctorTaskResponse response = new DoctorTaskResponse();
            response.setTaskId(firstTask.getTaskId());
            response.setDoctorId(firstTask.getDoctorId());
            response.setChildId(null); // Grouped response
            response.setChildName(null);
            response.setGameId(firstTask.getGameId());
            response.setSelectedGames(getSelectedGamesFromGameId(firstTask.getGameId()));
            response.setTaskTitle(firstTask.getTaskTitle());
            response.setTaskDescription(firstTask.getTaskDescription());
            response.setStartTime(firstTask.getStartTime());
            response.setEndTime(firstTask.getEndTime());
            response.setStatus(firstTask.getStatus());
            response.setCreatedAt(firstTask.getCreatedAt());
            response.setUpdatedAt(firstTask.getUpdatedAt());
            response.setAssignedChildren(assignedChildren);
            response.setTotalAssigned(taskGroup.size());
            response.setCompletedCount(completedCount);
            
            responses.add(response);
        }
        
        return responses;
    }
    
    /**
     * Convert DoctorTask entity to DoctorTaskResponse
     */
    private DoctorTaskResponse convertToTaskResponse(DoctorTask task) {
        DoctorTaskResponse response = new DoctorTaskResponse();
        response.setTaskId(task.getTaskId());
        response.setDoctorId(task.getDoctorId());
        response.setChildId(task.getChildId());
        response.setChildName(getChildName(task.getChildId()));
        response.setGameId(task.getGameId());
        response.setSelectedGames(getSelectedGamesFromGameId(task.getGameId()));
        response.setTaskTitle(task.getTaskTitle());
        response.setTaskDescription(task.getTaskDescription());
        response.setStartTime(task.getStartTime());
        response.setEndTime(task.getEndTime());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
    
    /**
     * Get child name from parent service
     */
    private String getChildName(Long childId) {
        try {
            String url = PARENT_SERVICE_URL + "/children/" + childId;
            Map<String, Object> child = restTemplate.getForObject(url, Map.class);
            return child != null ? (String) child.get("name") : "Unknown Child";
        } catch (Exception e) {
            System.err.println("Error fetching child name for child ID " + childId + ": " + e.getMessage());
            return "Unknown Child";
        }
    }
}