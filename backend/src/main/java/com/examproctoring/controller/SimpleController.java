package com.examproctoring.controller;

import com.examproctoring.model.CompletedExam;
import com.examproctoring.repository.CompletedExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/simple")
@CrossOrigin(origins = "*")
public class SimpleController {
    
    @Autowired
    private CompletedExamRepository completedExamRepository;
    
    @GetMapping("/completed/{studentName}")
    public List<Long> getCompletedExams(@PathVariable String studentName) {
        System.out.println("Getting completed exams for student: " + studentName);
        List<CompletedExam> completed = completedExamRepository.findByStudentName(studentName);
        System.out.println("Found " + completed.size() + " completed exams");
        List<Long> examIds = completed.stream().map(CompletedExam::getExamId).collect(Collectors.toList());
        System.out.println("Returning exam IDs: " + examIds);
        return examIds;
    }
    
    @GetMapping("/complete/{studentName}/{examId}/{score}")
    public String completeExam(@PathVariable String studentName, @PathVariable Long examId, @PathVariable Integer score) {
        System.out.println("Completing exam - Student: " + studentName + ", ExamId: " + examId + ", Score: " + score);
        try {
            if (!completedExamRepository.existsByStudentNameAndExamId(studentName, examId)) {
                CompletedExam completed = new CompletedExam(studentName, examId, score);
                CompletedExam saved = completedExamRepository.save(completed);
                System.out.println("Exam completion saved with ID: " + saved.getId());
                return "SUCCESS";
            }
            System.out.println("Exam already completed");
            return "ALREADY_COMPLETED";
        } catch (Exception e) {
            System.err.println("Error saving exam completion: " + e.getMessage());
            e.printStackTrace();
            return "ERROR: " + e.getMessage();
        }
    }
    
    @GetMapping("/test")
    public String testDatabase() {
        try {
            long count = completedExamRepository.count();
            return "Database connected. Total completed exams: " + count;
        } catch (Exception e) {
            return "Database error: " + e.getMessage();
        }
    }
}