package com.examproctoring.model;

import jakarta.persistence.Embeddable;
import java.time.LocalDateTime;

@Embeddable
public class ProctoringAlert {
    private String alertType;
    private String description;
    private LocalDateTime timestamp;
    private String studentName;
    
    public ProctoringAlert() {}
    
    public ProctoringAlert(String alertType, String description) {
        this.alertType = alertType;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }
    
    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
}