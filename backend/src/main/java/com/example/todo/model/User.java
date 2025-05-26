package com.example.todo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String password;

    @Column(name = "date_of_birth", nullable = false)
    private String dateOfBirth;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true)
    private String username;

    public User() {}

    public User(String password, String dateOfBirth, String email, String firstName, String lastName, String username) {
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
    }

    // Getters and setters
    public Long getId() { return id; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
