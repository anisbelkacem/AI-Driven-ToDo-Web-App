package com.example.todo.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class TaskTest {

    @Test
    void testNoArgsConstructorAndSettersAndGetters() {
        Task task = new Task();
        task.setId(10L);
        task.setTitle("Test Task");
        task.setCompleted(true);
        task.setPriority(5);
        LocalDate date = LocalDate.of(2024, 6, 1);
        task.setDate(date);

        User user = new User();
        user.setId(1L);
        task.setUser(user);

        assertEquals(10L, task.getId());
        assertEquals("Test Task", task.getTitle());
        assertTrue(task.isCompleted());
        assertEquals(5, task.getPriority());
        assertEquals(date, task.getDate());
        assertEquals(user, task.getUser());
    }

    @Test
    void testAllArgsConstructor() {
        Task task = new Task(20L, "Another Task", false);

        assertEquals(20L, task.getId());
        assertEquals("Another Task", task.getTitle());
        assertFalse(task.isCompleted());
    }
}
