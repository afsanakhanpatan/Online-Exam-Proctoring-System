package com.examproctoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class}, scanBasePackages = "com.examproctoring")
@CrossOrigin(origins = "*")
public class ExamProctoringApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExamProctoringApplication.class, args);
    }
}