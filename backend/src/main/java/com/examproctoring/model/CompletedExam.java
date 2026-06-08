package com.examproctoring.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "completed_exams")
public class CompletedExam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String studentName;
    
    @Column(nullable = false)
    private Long examId;
    
    @Column(nullable = false)
    private Integer score;
    
    @Column(nullable = false)
    private LocalDateTime completedAt;
    
    public CompletedExam() {}
    
    public CompletedExam(String studentName, Long examId, Integer score) {
        this.studentName = studentName;
        this.examId = examId;
        this.score = score;
        this.completedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}