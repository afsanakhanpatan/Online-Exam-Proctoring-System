package com.examproctoring.repository;

import com.examproctoring.model.CompletedExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompletedExamRepository extends JpaRepository<CompletedExam, Long> {
    List<CompletedExam> findByStudentName(String studentName);
    boolean existsByStudentNameAndExamId(String studentName, Long examId);
}