package org.example.springapp.controller;

import org.example.springapp.entity.User;
import org.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Login request received: " + request.username);
        
        if (request.username == null || request.password == null) {
            return ResponseEntity.badRequest().body(new LoginResponse("Username and password required", null));
        }
        
        Optional<User> user = userRepository.findByUsername(request.username);
        
        if (user.isPresent() && user.get().getPassword().equals(request.password) && user.get().getRole().equals(request.role)) {
            return ResponseEntity.ok(new LoginResponse("Login successful", user.get().getId()));
        }
        
        return ResponseEntity.badRequest().body(new LoginResponse("Invalid credentials or role", null));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.username).isPresent()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Username already exists", null));
        }
        
        User user = new User();
        user.setUsername(request.username);
        user.setPassword(request.password);
        user.setEmail(request.email);
        user.setRole(request.role);
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(new LoginResponse("Registration successful", savedUser.getId()));
    }
    
    static class LoginRequest {
        public String username;
        public String password;
        public String role;

    }
    
    static class RegisterRequest {
        public String username;
        public String password;
        public String email;
        public String role;

    }
    
    static class LoginResponse {
        public String message;
        public Long userId;
        
        public LoginResponse(String message, Long userId) {
            this.message = message;
            this.userId = userId;
        }

    }
}