package com.kinetrexa.expensetracker.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getAdminSummary() {
        return Map.of(
                "message", "Admin access granted",
                "totalUsers", userRepository.count()
        );
    }
}