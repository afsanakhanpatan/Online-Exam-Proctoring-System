package com.examproctoring.controller;

import com.examproctoring.model.User;
import com.examproctoring.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3001")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String roleStr = request.get("role");
            
            User.Role role = User.Role.valueOf(roleStr.toUpperCase());
            String token = authService.register(username, email, password, role);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "role", role.name(),
                "username", username
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            String token = authService.login(username, password);
            User user = authService.getUserByUsername(username);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole().name(),
                "username", username
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}