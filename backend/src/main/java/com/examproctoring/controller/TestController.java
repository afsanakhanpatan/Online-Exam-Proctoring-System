package com.examproctoring.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3001")
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        return "Backend is working!";
    }
}