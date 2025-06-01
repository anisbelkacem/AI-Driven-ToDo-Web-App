package com.example.todo.service;

import com.example.todo.model.User;
import com.example.todo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userService = new UserService();
        // Use reflection to inject the mock (since field is private and @Autowired)
        java.lang.reflect.Field field;
        try {
            field = UserService.class.getDeclaredField("userRepository");
            field.setAccessible(true);
            field.set(userService, userRepository);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void registerUser_success() {
        User user = new User("pass", "2000-01-01", "test@example.com", "John", "Doe", null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(null);
        when(userRepository.save(any(User.class))).thenReturn(user);

        boolean result = userService.registerUser(user);

        assertTrue(result);
        assertEquals("John Doe", user.getUsername());
        verify(userRepository).save(user);
    }

    @Test
    void registerUser_emailExists() {
        User user = new User("pass", "2000-01-01", "test@example.com", "John", "Doe", null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);

        boolean result = userService.registerUser(user);

        assertFalse(result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void authenticateUser_success() {
        User user = new User("pass", "2000-01-01", "test@example.com", "John", "Doe", null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);

        assertTrue(userService.authenticateUser("test@example.com", "pass"));
    }

    @Test
    void authenticateUser_wrongPassword() {
        User user = new User("pass", "2000-01-01", "test@example.com", "John", "Doe", null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);

        assertFalse(userService.authenticateUser("test@example.com", "wrong"));
    }

    @Test
    void authenticateUser_userNotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(null);

        assertFalse(userService.authenticateUser("notfound@example.com", "pass"));
    }

    @Test
    void findByEmail_found() {
        User user = new User("pass", "2000-01-01", "test@example.com", "John", "Doe", null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);

        User result = userService.findByEmail("test@example.com");
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void findByEmail_notFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(null);

        User result = userService.findByEmail("notfound@example.com");
        assertNull(result);
    }
}
