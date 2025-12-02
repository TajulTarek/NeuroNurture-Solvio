package com.example.doctor.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "performance_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long childId;
    
    @Column(nullable = false)
    private String childName;
    
    @Column(nullable = false)
    private Long parentId;
    
    @Column
    private String parentName;
    
    @Column(nullable = false)
    private Long doctorId;
    
    @Column(nullable = false)
    private String selectedGames; // JSON array of game types e.g. ["gaze", "gesture", "dance"]
    
    @Column(columnDefinition = "TEXT")
    private String gameSessionsData; // JSON containing last 3 sessions per game
    
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, REVIEWED
    
    @Column(columnDefinition = "TEXT")
    private String doctorResponse; // Doctor's analysis text
    
    @Column
    private String verdict; // SCREENING_NEEDED, NOT_NEEDED, INCONCLUSIVE, null (not yet decided)
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime reviewedAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

