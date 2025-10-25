package org.example.springapp.controller;

import org.example.springapp.entity.User;
import org.example.springapp.repository.UserRepository;
import org.example.springapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User userData = user.get();
            return ResponseEntity.ok(new UserResponse(userData.getId(), userData.getUsername(), 
                                                    userData.getEmail(), userData.getRole()));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request, Authentication auth) {
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(request.currentPassword)) {
                user.setPassword(request.newPassword);
                userRepository.save(user);
                return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
            }
            return ResponseEntity.badRequest().body(new MessageResponse("Current password is incorrect"));
        }
        return ResponseEntity.notFound().build();
    }

    static class UserResponse {
        public Long id;
        public String username;
        public String email;
        public String role;

        public UserResponse(Long id, String username, String email, String role) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
        }
    }

    static class PasswordResetRequest {
        public String currentPassword;
        public String newPassword;
    }

    static class MessageResponse {
        public String message;

        public MessageResponse(String message) {
            this.message = message;
        }
    }
}