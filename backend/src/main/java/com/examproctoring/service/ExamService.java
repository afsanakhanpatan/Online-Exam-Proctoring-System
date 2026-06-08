package com.examproctoring.service;

import com.examproctoring.model.*;
import com.examproctoring.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ExamService {
    
    @Autowired
    private ExamRepository examRepository;
    
    @Autowired
    private ExamSessionRepository sessionRepository;
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    @Autowired
    private CompletedExamRepository completedExamRepository;
    
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
    
    public Exam getExamById(Long id) {
        Exam exam = examRepository.findById(id).orElse(null);
        if (exam != null) {
            // Force loading of questions
            exam.getQuestions().size();
            System.out.println("Loaded exam with " + (exam.getQuestions() != null ? exam.getQuestions().size() : 0) + " questions");
        }
        return exam;
    }
    
    public Exam createExam(Exam exam) {
        System.out.println("Creating exam: " + exam.getTitle());
        System.out.println("Questions received: " + (exam.getQuestions() != null ? exam.getQuestions().size() : "null"));
        
        // Save exam first
        Exam savedExam = examRepository.save(exam);
        System.out.println("Saved exam with ID: " + savedExam.getId());
        
        // Then save questions separately
        if (exam.getQuestions() != null && !exam.getQuestions().isEmpty()) {
            for (Question question : exam.getQuestions()) {
                question.setExam(savedExam);
                System.out.println("Saving question: " + question.getQuestionText());
            }
            savedExam.setQuestions(exam.getQuestions());
            savedExam = examRepository.save(savedExam);
        }
        
        return savedExam;
    }
    
    public ExamSession startExamSession(String studentName, String studentEmail, Long examId) {
        Exam exam = getExamById(examId);
        if (exam == null) return null;
        
        ExamSession session = new ExamSession(studentName, studentEmail, exam);
        return sessionRepository.save(session);
    }
    
    public ExamSession submitAnswer(Long sessionId, Long questionId, Integer answer) {
        ExamSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) return null;
        
        if (session.getAnswers() == null) {
            session.setAnswers(new ArrayList<>());
        }
        
        // Remove existing answer for this question
        session.getAnswers().removeIf(a -> a.getQuestionId().equals(questionId));
        
        // Add new answer
        StudentAnswer studentAnswer = new StudentAnswer(questionId, answer);
        session.getAnswers().add(studentAnswer);
        
        System.out.println("Answer submitted - Session: " + sessionId + ", Question: " + questionId + ", Answer: " + answer);
        
        return sessionRepository.save(session);
    }
    
    public ExamSession endExamSession(Long sessionId) {
        ExamSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) return null;
        
        session.setEndTime(LocalDateTime.now());
        session.setStatus("COMPLETED");
        
        // Calculate score
        int totalScore = 0;
        int correctAnswers = 0;
        if (session.getAnswers() != null && session.getExam() != null && session.getExam().getQuestions() != null) {
            System.out.println("Calculating score - Total answers: " + session.getAnswers().size());
            for (StudentAnswer answer : session.getAnswers()) {
                Question question = session.getExam().getQuestions().stream()
                    .filter(q -> q.getId().equals(answer.getQuestionId()))
                    .findFirst().orElse(null);
                
                if (question != null) {
                    System.out.println("Question " + question.getId() + ": Student answer=" + answer.getSelectedAnswer() + ", Correct=" + question.getCorrectAnswer());
                    if (question.getCorrectAnswer().equals(answer.getSelectedAnswer())) {
                        totalScore += question.getMarks();
                        correctAnswers++;
                    }
                }
            }
        }
        session.setScore(totalScore);
        System.out.println("Final score: " + totalScore + ", Correct answers: " + correctAnswers);
        
        ExamSession savedSession = sessionRepository.save(session);
        System.out.println("Exam session ended - ID: " + savedSession.getId() + ", Student: " + savedSession.getStudentName() + ", Status: " + savedSession.getStatus());
        
        // Save to completed exams table
        CompletedExam completedExam = new CompletedExam(session.getStudentName(), session.getExam().getId(), totalScore);
        completedExamRepository.save(completedExam);
        
        return savedSession;
    }
    
    public void addProctoringAlert(Long sessionId, String alertType, String description) {
        ExamSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null) return;
        
        if (session.getAlerts() == null) {
            session.setAlerts(new ArrayList<>());
        }
        
        ProctoringAlert alert = new ProctoringAlert(alertType, description);
        alert.setStudentName(session.getStudentName());
        session.getAlerts().add(alert);
        sessionRepository.save(session);
    }
    
    public String analyzeImageForCheating(String base64Image) {
        return geminiAIService.analyzeImage(base64Image);
    }
    
    public String generateQuestionsWithAI(String topic, int count, String level) {
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("topic", topic);
        requestData.put("count", count);
        requestData.put("level", level);
        return geminiAIService.generateQuestions(requestData);
    }
    
    public void deleteExam(Long id) {
        // Delete related exam sessions first
        List<ExamSession> sessions = sessionRepository.findByExamId(id);
        sessionRepository.deleteAll(sessions);
        
        // Then delete the exam (questions will be deleted due to cascade)
        examRepository.deleteById(id);
    }
    
    public List<ProctoringAlert> getAllAlerts() {
        List<ExamSession> sessions = sessionRepository.findAll();
        List<ProctoringAlert> allAlerts = new ArrayList<>();
        
        for (ExamSession session : sessions) {
            if (session.getAlerts() != null) {
                allAlerts.addAll(session.getAlerts());
            }
        }
        
        return allAlerts;
    }
    
    public List<ExamSession> getAllExamSessions() {
        List<ExamSession> sessions = sessionRepository.findAll();
        // Force load exam data for each session
        for (ExamSession session : sessions) {
            if (session.getExam() != null) {
                session.getExam().getId(); // Force load exam
                session.getExam().getTitle(); // Force load exam title
            }
        }
        return sessions;
    }
    
    public List<Long> getCompletedExamsByStudent(String studentName) {
        List<CompletedExam> completedExams = completedExamRepository.findByStudentName(studentName);
        System.out.println("Found " + completedExams.size() + " completed exams for student: " + studentName);
        return completedExams.stream()
            .map(CompletedExam::getExamId)
            .toList();
    }
    
    public void markExamCompleted(String studentName, Long examId, Integer score) {
        if (!completedExamRepository.existsByStudentNameAndExamId(studentName, examId)) {
            CompletedExam completedExam = new CompletedExam(studentName, examId, score);
            completedExamRepository.save(completedExam);
            System.out.println("Marked exam " + examId + " as completed for student: " + studentName);
        }
    }
    
    public Map<String, Object> getStudentStatistics(String studentName) {
        List<CompletedExam> completedExams = completedExamRepository.findByStudentName(studentName);
        Map<String, Object> stats = new HashMap<>();
        
        if (completedExams.isEmpty()) {
            stats.put("totalExams", 0);
            stats.put("averageScore", 0);
            stats.put("lastExamScore", 0);
            stats.put("highestScore", 0);
            stats.put("lastExamTitle", "No exams taken");
            stats.put("examHistory", new ArrayList<>());
            stats.put("classRank", 1);
            stats.put("totalStudents", 1);
            return stats;
        }
        
        // Sort by completion date
        completedExams.sort((e1, e2) -> e1.getCompletedAt().compareTo(e2.getCompletedAt()));
        
        // Calculate statistics
        int totalExams = completedExams.size();
        double averageScore = completedExams.stream().mapToInt(CompletedExam::getScore).average().orElse(0.0);
        int highestScore = completedExams.stream().mapToInt(CompletedExam::getScore).max().orElse(0);
        
        // Get last exam details
        CompletedExam lastExam = completedExams.get(completedExams.size() - 1);
        String lastExamTitle = "Unknown";
        int lastExamScore = lastExam.getScore();
        Exam exam = examRepository.findById(lastExam.getExamId()).orElse(null);
        if (exam != null) {
            lastExamTitle = exam.getTitle();
        }
        
        // Create exam history with exam titles
        List<Map<String, Object>> examHistory = new ArrayList<>();
        for (CompletedExam completedExam : completedExams) {
            Map<String, Object> examData = new HashMap<>();
            Exam examDetails = examRepository.findById(completedExam.getExamId()).orElse(null);
            examData.put("title", examDetails != null ? examDetails.getTitle() : "Unknown Exam");
            examData.put("score", completedExam.getScore());
            examData.put("date", completedExam.getCompletedAt().toString());
            examData.put("examId", completedExam.getExamId());
            examHistory.add(examData);
        }
        
        // Calculate class rank (simplified - based on average score)
        List<CompletedExam> allCompletedExams = completedExamRepository.findAll();
        Map<String, Double> studentAverages = new HashMap<>();
        
        for (CompletedExam ce : allCompletedExams) {
            studentAverages.merge(ce.getStudentName(), (double) ce.getScore(), 
                (existing, newScore) -> (existing + newScore) / 2);
        }
        
        long betterStudents = studentAverages.values().stream()
            .mapToLong(avg -> avg > averageScore ? 1 : 0)
            .sum();
        
        int classRank = (int) betterStudents + 1;
        int totalStudents = studentAverages.size();
        
        stats.put("totalExams", totalExams);
        stats.put("averageScore", Math.round(averageScore));
        stats.put("lastExamScore", lastExamScore);
        stats.put("highestScore", highestScore);
        stats.put("lastExamTitle", lastExamTitle);
        stats.put("examHistory", examHistory);
        stats.put("classRank", classRank);
        stats.put("totalStudents", totalStudents);
        
        return stats;
    }
    
    public List<Map<String, Object>> getClassLeaderboard() {
        List<CompletedExam> allCompletedExams = completedExamRepository.findAll();
        Map<String, List<Integer>> studentScores = new HashMap<>();
        
        // Group scores by student
        for (CompletedExam exam : allCompletedExams) {
            studentScores.computeIfAbsent(exam.getStudentName(), k -> new ArrayList<>())
                         .add(exam.getScore());
        }
        
        // Calculate averages and create leaderboard
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (Map.Entry<String, List<Integer>> entry : studentScores.entrySet()) {
            String studentName = entry.getKey();
            List<Integer> scores = entry.getValue();
            double average = scores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            int totalExams = scores.size();
            int bestScore = scores.stream().mapToInt(Integer::intValue).max().orElse(0);
            
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("studentName", studentName);
            studentData.put("averageScore", Math.round(average));
            studentData.put("totalExams", totalExams);
            studentData.put("bestScore", bestScore);
            studentData.put("grade", average >= 90 ? "A+" : average >= 80 ? "A" : average >= 70 ? "B" : "C");
            
            leaderboard.add(studentData);
        }
        
        // Sort by average score descending
        leaderboard.sort((a, b) -> Integer.compare(
            (Integer) b.get("averageScore"), 
            (Integer) a.get("averageScore")
        ));
        
        // Add ranks
        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).put("rank", i + 1);
        }
        
        return leaderboard;
    }
    
    public List<Map<String, Object>> getMalpracticeAlerts() {
        try {
            List<ExamSession> sessions = sessionRepository.findAll();
            List<Map<String, Object>> malpracticeData = new ArrayList<>();
            
            for (ExamSession session : sessions) {
                if (session.getAlerts() != null && !session.getAlerts().isEmpty()) {
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("studentName", session.getStudentName() != null ? session.getStudentName() : "Unknown Student");
                    studentData.put("examTitle", session.getExam() != null ? session.getExam().getTitle() : "Unknown Exam");
                    studentData.put("alertCount", session.getAlerts().size());
                    studentData.put("sessionDate", session.getStartTime() != null ? session.getStartTime().toString() : new java.util.Date().toString());
                    
                    List<Map<String, Object>> alertDetails = new ArrayList<>();
                    for (ProctoringAlert alert : session.getAlerts()) {
                        Map<String, Object> alertInfo = new HashMap<>();
                        alertInfo.put("type", alert.getAlertType() != null ? alert.getAlertType() : "UNKNOWN");
                        alertInfo.put("description", alert.getDescription() != null ? alert.getDescription() : "No description");
                        alertInfo.put("timestamp", alert.getTimestamp() != null ? alert.getTimestamp().toString() : new java.util.Date().toString());
                        alertDetails.add(alertInfo);
                    }
                    studentData.put("alerts", alertDetails);
                    malpracticeData.add(studentData);
                }
            }
            
            // Sort by alert count descending
            malpracticeData.sort((a, b) -> Integer.compare(
                (Integer) b.get("alertCount"), 
                (Integer) a.get("alertCount")
            ));
            
            return malpracticeData;
        } catch (Exception e) {
            System.err.println("Error fetching malpractice alerts: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(); // Return empty list on error
        }
    }
}