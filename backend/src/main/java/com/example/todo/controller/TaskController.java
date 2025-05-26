package com.example.todo.controller;

import com.example.todo.model.Task;
import com.example.todo.model.User;
import com.example.todo.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskRepository repository;

    public TaskController(TaskRepository repository) {
        this.repository = repository;
    }

    // GET all tasks
    @GetMapping
    public List<Task> getAllTasks(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return List.of();
        return repository.findByUserId(user.getId());
    }

    // POST a new task
    @PostMapping
    public Task createTask(@RequestBody Task task, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) throw new RuntimeException("Not logged in");
        task.setUser(user);
        return repository.save(task);
    }

    // DELETE a task by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.notFound().build(); // 404 Not Found
    }

    // PUT (update) a task by ID
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        Optional<Task> optionalTask = repository.findById(id);

        if (optionalTask.isPresent()) {
            Task existingTask = optionalTask.get();
            existingTask.setTitle(updatedTask.getTitle());
            existingTask.setCompleted(updatedTask.isCompleted());
            Task savedTask = repository.save(existingTask);
            return ResponseEntity.ok(savedTask);
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    // After login, store user info
    @PostMapping("/reorder")
    public ResponseEntity<?> reorderTasks(@RequestBody List<Task> tasks) {
        for (Task t : tasks) {
            Task existing = repository.findById(t.getId()).orElse(null);
            if (existing != null) {
                existing.setPriority(t.getPriority());
                repository.save(existing);
            }
        }
        return ResponseEntity.ok().build();
    }
}
