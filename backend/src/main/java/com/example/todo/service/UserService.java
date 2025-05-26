package com.example.todo.service;

import com.example.todo.model.User;
import com.example.todo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public boolean registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return false; // Email already registered
        }
        // Auto-generate username with original casing and a space
        String generatedUsername = user.getFirstName() + " " + user.getLastName();
        user.setUsername(generatedUsername.trim());
        userRepository.save(user);
        return true;
    }

    public boolean authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        return user != null && user.getPassword().equals(password);
    }

    public User findByEmail(String email) {
        User user = userRepository.findByEmail(email);
        return user != null ? user : null; // Return null if not found
        
    }
}