package com.examproctoring.service;

import com.examproctoring.config.JwtUtil;
import com.examproctoring.model.User;
import com.examproctoring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;



    @Autowired
    private JwtUtil jwtUtil;

    public String register(String username, String email, String password, User.Role role) {
        System.out.println("Registration attempt: " + username + ", " + email + ", " + role);
        
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(username, email, password, role);
        User savedUser = userRepository.save(user);
        System.out.println("User saved with ID: " + savedUser.getId());
        
        return jwtUtil.generateToken(username, role.name());
    }

    public String login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();
        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generateToken(username, user.getRole().name());
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}