package com.examproctoring.repository;

import com.examproctoring.model.ExamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {
    List<ExamSession> findByStudentEmail(String studentEmail);
    List<ExamSession> findByExamId(Long examId);
    List<ExamSession> findByStudentName(String studentName);
    List<ExamSession> findByStudentNameAndStatus(String studentName, String status);
}