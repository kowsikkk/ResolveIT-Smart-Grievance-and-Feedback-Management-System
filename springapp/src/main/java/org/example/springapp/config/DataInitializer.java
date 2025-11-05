package org.example.springapp.config;

import org.example.springapp.entity.User;
import org.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create test officers if they don't exist
        if (userRepository.findByUsername("officer1").isEmpty()) {
            User officer1 = new User();
            officer1.setUsername("officer1");
            officer1.setPassword("officer123");
            officer1.setEmail("officer1@example.com");
            officer1.setRole("officer");
            userRepository.save(officer1);
        }

        if (userRepository.findByUsername("officer2").isEmpty()) {
            User officer2 = new User();
            officer2.setUsername("officer2");
            officer2.setPassword("officer123");
            officer2.setEmail("officer2@example.com");
            officer2.setRole("officer");
            userRepository.save(officer2);
        }

        if (userRepository.findByUsername("officer3").isEmpty()) {
            User officer3 = new User();
            officer3.setUsername("officer3");
            officer3.setPassword("officer123");
            officer3.setEmail("officer3@example.com");
            officer3.setRole("officer");
            userRepository.save(officer3);
        }
    }
}