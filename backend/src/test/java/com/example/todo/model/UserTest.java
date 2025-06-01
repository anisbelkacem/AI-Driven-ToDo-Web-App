package com.example.todo.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testNoArgsConstructorAndSettersAndGetters() {
        User user = new User();
        user.setId(1L);
        user.setPassword("secret");
        user.setDateOfBirth("2000-01-01");
        user.setEmail("test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setUsername("johndoe");

        assertEquals(1L, user.getId());
        assertEquals("secret", user.getPassword());
        assertEquals("2000-01-01", user.getDateOfBirth());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("johndoe", user.getUsername());
    }

    @Test
    void testAllArgsConstructor() {
        User user = new User(
            "pass123",
            "1999-12-31",
            "user@example.com",
            "Alice",
            "Smith",
            "alicesmith"
        );

        assertNull(user.getId());
        assertEquals("pass123", user.getPassword());
        assertEquals("1999-12-31", user.getDateOfBirth());
        assertEquals("user@example.com", user.getEmail());
        assertEquals("Alice", user.getFirstName());
        assertEquals("Smith", user.getLastName());
        assertEquals("alicesmith", user.getUsername());
    }
}
