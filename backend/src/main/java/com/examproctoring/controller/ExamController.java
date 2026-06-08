package com.examproctoring.controller;

import com.examproctoring.model.*;
import com.examproctoring.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ExamController {
    
    @Autowired
    private ExamService examService;
    
    @GetMapping
    public List<Exam> getAllExams() {
        return examService.getAllExams();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        return exam != null ? ResponseEntity.ok(exam) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}/questions-with-answers")
    public ResponseEntity<Map<String, Object>> getExamQuestionsWithAnswers(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        if (exam == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> examData = Map.of(
            "id", exam.getId(),
            "title", exam.getTitle(),
            "description", exam.getDescription(),
            "duration", exam.getDuration(),
            "questions", exam.getQuestions() != null ? exam.getQuestions() : List.of()
        );
        
        return ResponseEntity.ok(examData);
    }
    
    @PostMapping
    public Exam createExam(@RequestBody Exam exam) {
        return examService.createExam(exam);
    }
    
    @PostMapping("/{id}/start")
    public ResponseEntity<ExamSession> startExam(@PathVariable Long id, @RequestBody Map<String, String> studentInfo) {
        String studentName = studentInfo.get("studentName");
        String studentEmail = studentInfo.get("studentEmail");
        
        ExamSession session = examService.startExamSession(studentName, studentEmail, id);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.badRequest().build();
    }
    
    @PostMapping("/sessions/{sessionId}/answer")
    public ResponseEntity<ExamSession> submitAnswer(@PathVariable Long sessionId, @RequestBody Map<String, Object> answerData) {
        Long questionId = Long.valueOf(answerData.get("questionId").toString());
        Integer answer = Integer.valueOf(answerData.get("answer").toString());
        
        ExamSession session = examService.submitAnswer(sessionId, questionId, answer);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.badRequest().build();
    }
    
    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<Map<String, Object>> endExam(@PathVariable Long sessionId) {
        try {
            ExamSession session = examService.endExamSession(sessionId);
            if (session != null) {
                // Calculate percentage based on correct answers
                Exam exam = session.getExam();
                int totalQuestions = exam.getQuestions() != null ? exam.getQuestions().size() : 0;
                int correctAnswers = 0;
                
                if (session.getAnswers() != null && exam.getQuestions() != null) {
                    for (StudentAnswer answer : session.getAnswers()) {
                        for (Question question : exam.getQuestions()) {
                            if (question.getId().equals(answer.getQuestionId()) && 
                                question.getCorrectAnswer() == answer.getSelectedAnswer()) {
                                correctAnswers++;
                                break;
                            }
                        }
                    }
                }
                
                int percentage = totalQuestions > 0 ? (correctAnswers * 100) / totalQuestions : 0;
                
                return ResponseEntity.ok(Map.of(
                    "session", session,
                    "score", percentage,
                    "correctAnswers", correctAnswers,
                    "totalQuestions", totalQuestions
                ));
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to end exam"));
        }
    }
    
    @PostMapping("/sessions/{sessionId}/alert")
    public ResponseEntity<Void> addAlert(@PathVariable Long sessionId, @RequestBody Map<String, String> alertData) {
        String alertType = alertData.get("alertType");
        String description = alertData.get("description");
        
        examService.addProctoringAlert(sessionId, alertType, description);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/analyze-image")
    public ResponseEntity<String> analyzeImage(@RequestBody Map<String, String> imageData) {
        String base64Image = imageData.get("image");
        String result = examService.analyzeImageForCheating(base64Image);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/generate-questions")
    public ResponseEntity<String> generateQuestions(@RequestBody Map<String, Object> requestData) {
        String topic = (String) requestData.get("topic");
        Integer count = (Integer) requestData.get("count");
        String level = (String) requestData.getOrDefault("level", "medium");
        
        String questions = examService.generateQuestionsWithAI(topic, count, level);
        return ResponseEntity.ok(questions);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/alerts")
    public ResponseEntity<List<ProctoringAlert>> getAllAlerts() {
        List<ProctoringAlert> alerts = examService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<List<ExamSession>> getAllExamSessions() {
        List<ExamSession> sessions = examService.getAllExamSessions();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/sessions/completed/{studentName}")
    public ResponseEntity<List<Long>> getCompletedExamsByStudent(@PathVariable String studentName) {
        List<Long> completedExamIds = examService.getCompletedExamsByStudent(studentName);
        return ResponseEntity.ok(completedExamIds);
    }
    
    @GetMapping("/complete/{studentName}/{examId}/{score}")
    public ResponseEntity<String> completeExam(@PathVariable String studentName, @PathVariable Long examId, @PathVariable Integer score) {
        examService.markExamCompleted(studentName, examId, score);
        return ResponseEntity.ok("Exam completed successfully");
    }
    
    @GetMapping("/stats/{studentName}")
    public ResponseEntity<Map<String, Object>> getStudentStats(@PathVariable String studentName) {
        Map<String, Object> stats = examService.getStudentStatistics(studentName);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        List<Map<String, Object>> leaderboard = examService.getClassLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
    
    @GetMapping("/malpractice-alerts")
    public ResponseEntity<List<Map<String, Object>>> getMalpracticeAlerts() {
        List<Map<String, Object>> alerts = examService.getMalpracticeAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    // Simple authentication endpoints
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String role = request.get("role");
            
            return ResponseEntity.ok(Map.of(
                "token", "dummy-token-" + username,
                "role", role,
                "username", username
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed"));
        }
    }
    
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            // Simple validation
            if (username != null && password != null) {
                String role = username.toLowerCase().contains("admin") ? "ADMIN" : "STUDENT";
                return ResponseEntity.ok(Map.of(
                    "token", "dummy-token-" + username,
                    "role", role,
                    "username", username
                ));
            }
            
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Login failed"));
        }
    }
}