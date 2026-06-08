package com.examproctoring.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exam_sessions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ExamSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String studentName;
    
    @Column(nullable = false)
    private String studentEmail;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private Exam exam;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    @ElementCollection
    @CollectionTable(name = "session_answers", joinColumns = @JoinColumn(name = "session_id"))
    private List<StudentAnswer> answers;
    
    @ElementCollection
    @CollectionTable(name = "proctoring_alerts", joinColumns = @JoinColumn(name = "session_id"))
    private List<ProctoringAlert> alerts;
    
    private Integer score;
    private String status; // STARTED, COMPLETED, TERMINATED
    
    // Constructors
    public ExamSession() {}
    
    public ExamSession(String studentName, String studentEmail, Exam exam) {
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.exam = exam;
        this.startTime = LocalDateTime.now();
        this.status = "STARTED";
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    
    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public List<StudentAnswer> getAnswers() { return answers; }
    public void setAnswers(List<StudentAnswer> answers) { this.answers = answers; }
    
    public List<ProctoringAlert> getAlerts() { return alerts; }
    public void setAlerts(List<ProctoringAlert> alerts) { this.alerts = alerts; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
