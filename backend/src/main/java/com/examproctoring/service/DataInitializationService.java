package com.examproctoring.service;

import com.examproctoring.model.Exam;
import com.examproctoring.model.Question;
import com.examproctoring.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private ExamRepository examRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create sample exam with questions
        Exam sampleExam = new Exam();
        sampleExam.setTitle("Java Programming Fundamentals");
        sampleExam.setDescription("Basic Java programming concepts and syntax");
        sampleExam.setDuration(30); // 30 minutes
        sampleExam.setStartTime(LocalDateTime.now());
        sampleExam.setEndTime(LocalDateTime.now().plusDays(7));

        // Create sample questions
        Question q1 = new Question();
        q1.setQuestionText("What is the correct way to declare a variable in Java?");
        q1.setOptions(Arrays.asList(
            "var x = 10;",
            "int x = 10;",
            "x = 10;",
            "declare int x = 10;"
        ));
        q1.setCorrectAnswer(1);
        q1.setMarks(2);
        q1.setExam(sampleExam);

        Question q2 = new Question();
        q2.setQuestionText("Which of the following is NOT a Java primitive data type?");
        q2.setOptions(Arrays.asList(
            "int",
            "boolean",
            "String",
            "double"
        ));
        q2.setCorrectAnswer(2);
        q2.setMarks(2);
        q2.setExam(sampleExam);

        Question q3 = new Question();
        q3.setQuestionText("What is the output of System.out.println(5 + 3 + \"Hello\");?");
        q3.setOptions(Arrays.asList(
            "53Hello",
            "8Hello",
            "Hello8",
            "Hello53"
        ));
        q3.setCorrectAnswer(1);
        q3.setMarks(3);
        q3.setExam(sampleExam);

        sampleExam.setQuestions(Arrays.asList(q1, q2, q3));

        // Save the exam (questions will be saved due to cascade)
        examRepository.save(sampleExam);

        System.out.println("Sample exam data initialized successfully!");
    }
}