package com.example.doctor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.doctor.entity.DoctorTask;

@Repository
public interface DoctorTaskRepository extends JpaRepository<DoctorTask, Long> {
    
    // Find all tasks for a specific doctor
    List<DoctorTask> findByDoctorId(Long doctorId);
    
    // Find all tasks for a specific child
    List<DoctorTask> findByChildId(Long childId);
    
    // Find tasks by doctor and child
    List<DoctorTask> findByDoctorIdAndChildId(Long doctorId, Long childId);
    
    // Find tasks by status
    List<DoctorTask> findByDoctorIdAndStatus(Long doctorId, String status);
    
    // Find tasks by child and status
    List<DoctorTask> findByChildIdAndStatus(Long childId, String status);
    
    // Find tasks by task_id
    List<DoctorTask> findByTaskId(Long taskId);
    
    // Find tasks by doctor and task_id
    List<DoctorTask> findByDoctorIdAndTaskId(Long doctorId, Long taskId);
    
    // Delete all tasks by task_id
    void deleteByTaskId(Long taskId);
    
    // Note: Bit-mapped game queries are handled in the service layer
    // since HQL doesn't support bitwise operations directly
}
