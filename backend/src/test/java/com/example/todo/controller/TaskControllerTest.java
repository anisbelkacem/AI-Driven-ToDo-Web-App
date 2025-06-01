package com.example.todo.controller;

import com.example.todo.model.Task;
import com.example.todo.model.User;
import com.example.todo.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser 
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskRepository repository;

    private User mockUser() {
        User user = new User();
        user.setId(1L); // Add this line!
        user.setEmail("test@example.com");
        return user;
    }

    @Test
    void createTask_savesTaskForUser_andUseGeneratedId() throws Exception {
        User user = mockUser();

        // Simulate the saved task returned by the repository (with generated ID)
        Task savedTask = new Task();
        savedTask.setTitle("New Task");
        savedTask.setUser(user);
        savedTask.setCompleted(false);
        // Simulate DB-generated ID
        savedTask.setId(42L);

        Mockito.when(repository.save(any(Task.class))).thenReturn(savedTask);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("user", user);

        mockMvc.perform(post("/api/tasks")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"New Task\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Task"))
                .andExpect(jsonPath("$.id").value(42L));
    }

    @Test
    void getAllTasks_returnsTasksForUser() throws Exception {
        User user = mockUser();

        Task task = new Task();
        task.setTitle("Test Task");
        task.setUser(user);
        task.setId(100L);

        Mockito.when(repository.findByUserId(anyLong())).thenReturn(List.of(task));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("user", user);

        mockMvc.perform(get("/api/tasks").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getAllTasks_returnsEmptyList_whenUserNotInSession() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }


    @Test
    void deleteTask_existingId_deletesAndReturnsNoContent() throws Exception {
        Mockito.when(repository.existsById(anyLong())).thenReturn(true);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteTask_nonExistingId_returnsNotFound() throws Exception {
        Mockito.when(repository.existsById(anyLong())).thenReturn(false);

        mockMvc.perform(delete("/api/tasks/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTask_existingId_updatesAndReturnsTask() throws Exception {
        Task existing = new Task();
        existing.setTitle("Old");
        existing.setCompleted(false);
        existing.setId(200L);

        Task updated = new Task();
        updated.setTitle("Updated");
        updated.setCompleted(true);
        updated.setId(200L);

        Mockito.when(repository.findById(eq(200L))).thenReturn(Optional.of(existing));
        Mockito.when(repository.save(any(Task.class))).thenReturn(updated);

        mockMvc.perform(put("/api/tasks/200")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated\",\"completed\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated"))
                .andExpect(jsonPath("$.completed").value(true))
                .andExpect(jsonPath("$.id").value(200L));
    }

    @Test
    void updateTask_nonExistingId_returnsNotFound() throws Exception {
        Mockito.when(repository.findById(anyLong())).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/tasks/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated\",\"completed\":true}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void reorderTasks_updatesPriorities() throws Exception {
        Task t1 = new Task();
        t1.setPriority(0);
        t1.setId(1L);

        Task t2 = new Task();
        t2.setPriority(1);
        t2.setId(2L);

        Mockito.when(repository.findById(1L)).thenReturn(Optional.of(t1));
        Mockito.when(repository.findById(2L)).thenReturn(Optional.of(t2));
        Mockito.when(repository.save(any(Task.class))).thenReturn(t1, t2);

        String json = "[{\"id\":1,\"priority\":1},{\"id\":2,\"priority\":0}]";

        mockMvc.perform(post("/api/tasks/reorder")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk());
    }

    @Test
    void reorderTasks_doesNothing_whenTasksNotFound() throws Exception {
        Mockito.when(repository.findById(anyLong())).thenReturn(Optional.empty());

        String json = "[{\"id\":99,\"priority\":5}]";

        mockMvc.perform(post("/api/tasks/reorder")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk());
    }

    @Test
    void updateTask_existingId_updatesOnlyTitleAndCompleted() throws Exception {
        Task existing = new Task();
        existing.setTitle("Old");
        existing.setCompleted(false);
        existing.setId(300L);
        existing.setPriority(5);

        Task updated = new Task();
        updated.setTitle("New Title");
        updated.setCompleted(true);
        updated.setId(300L);
        updated.setPriority(99); // Should not update priority

        Mockito.when(repository.findById(eq(300L))).thenReturn(Optional.of(existing));
        Mockito.when(repository.save(any(Task.class))).thenReturn(existing);

        mockMvc.perform(put("/api/tasks/300")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"New Title\",\"completed\":true,\"priority\":99}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Title"))
                .andExpect(jsonPath("$.completed").value(true));
    }
}
