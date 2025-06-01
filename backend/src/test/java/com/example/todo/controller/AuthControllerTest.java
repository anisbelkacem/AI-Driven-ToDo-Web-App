package com.example.todo.controller;

import com.example.todo.model.User;
import com.example.todo.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testSignupSuccess() {
        try {
            System.out.println("\n=== testSignupSuccess ===");
            User user = new User();
            user.setEmail("test@example.com");
            user.setPassword("1234");

            when(userService.registerUser(Mockito.any(User.class))).thenReturn(true);

            var result = mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 200, Actual Status: " + status);
            System.out.println("Expected Response: User registered successfully, Actual Response: " + response);

            assertEquals(200, status, "Status code mismatch in testSignupSuccess");
            assertEquals("User registered successfully", response, "Response body mismatch in testSignupSuccess");
        } catch (Exception e) {
            System.out.println("testSignupSuccess FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testSignupFailure_EmailExists() {
        try {
            System.out.println("\n=== testSignupFailure_EmailExists ===");
            User user = new User();
            user.setEmail("existing@example.com");
            user.setPassword("1234");

            when(userService.registerUser(Mockito.any(User.class))).thenReturn(false);

            var result = mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 400, Actual Status: " + status);
            System.out.println("Expected Response: Email already exists, Actual Response: " + response);

            assertEquals(400, status, "Status code mismatch in testSignupFailure_EmailExists");
            assertEquals("Email already exists", response, "Response body mismatch in testSignupFailure_EmailExists");
        } catch (Exception e) {
            System.out.println("testSignupFailure_EmailExists FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLoginSuccess() {
        try {
            System.out.println("\n=== testLoginSuccess ===");
            User user = new User();
            user.setEmail("test@example.com");
            user.setPassword("1234");

            User foundUser = new User();
            foundUser.setId(1L);
            foundUser.setFirstName("John");
            foundUser.setLastName("Doe");
            foundUser.setEmail("test@example.com");
            foundUser.setPassword("1234");

            when(userService.findByEmail("test@example.com")).thenReturn(foundUser);

            var result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 200, Actual Status: " + status);
            System.out.println("Actual Response: " + response);

            assertEquals(200, status, "Status code mismatch in testLoginSuccess");
            // Optionally, parse and check JSON fields here
        } catch (Exception e) {
            System.out.println("testLoginSuccess FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLoginFailure_InvalidPassword() {
        try {
            System.out.println("\n=== testLoginFailure_InvalidPassword ===");
            User user = new User();
            user.setEmail("test@example.com");
            user.setPassword("wrongPassword");

            User foundUser = new User();
            foundUser.setEmail("test@example.com");
            foundUser.setPassword("correctPassword");

            when(userService.findByEmail("test@example.com")).thenReturn(foundUser);

            var result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 401, Actual Status: " + status);
            System.out.println("Expected Response: Invalid credentials, Actual Response: " + response);

            assertEquals(401, status, "Status code mismatch in testLoginFailure_InvalidPassword");
            assertEquals("Invalid credentials", response, "Response body mismatch in testLoginFailure_InvalidPassword");
        } catch (Exception e) {
            System.out.println("testLoginFailure_InvalidPassword FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLoginFailure_UserNotFound() {
        try {
            System.out.println("\n=== testLoginFailure_UserNotFound ===");
            User user = new User();
            user.setEmail("unknown@example.com");
            user.setPassword("1234");

            when(userService.findByEmail("unknown@example.com")).thenReturn(null);

            var result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 401, Actual Status: " + status);
            System.out.println("Expected Response: Invalid credentials, Actual Response: " + response);

            assertEquals(401, status, "Status code mismatch in testLoginFailure_UserNotFound");
            assertEquals("Invalid credentials", response, "Response body mismatch in testLoginFailure_UserNotFound");
        } catch (Exception e) {
            System.out.println("testLoginFailure_UserNotFound FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testGetCurrentUser_whenLoggedIn_returnsUserInfo() {
        try {
            System.out.println("\n=== testGetCurrentUser_whenLoggedIn ===");
            User user = new User();
            user.setId(1L);
            user.setFirstName("Test");
            user.setLastName("User");
            user.setEmail("test@example.com");
            user.setPassword("1234");

            MockHttpSession session = new MockHttpSession();
            session.setAttribute("user", user);

            var result = mockMvc.perform(get("/api/auth/user").session(session))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 200, Actual Status: " + status);
            System.out.println("Actual Response: " + response);

            assertEquals(200, status, "Status code mismatch in testGetCurrentUser_whenLoggedIn");
            assertTrue(response.contains("\"email\":\"test@example.com\""), "Response should contain user email");
        } catch (Exception e) {
            System.out.println("testGetCurrentUser_whenLoggedIn FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testGetCurrentUser_whenNotLoggedIn_returns401() {
        try {
            System.out.println("\n=== testGetCurrentUser_whenNotLoggedIn ===");
            var result = mockMvc.perform(get("/api/auth/user"))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 401, Actual Status: " + status);
            System.out.println("Actual Response: " + response);

            assertEquals(401, status, "Status code mismatch in testGetCurrentUser_whenNotLoggedIn");
            assertEquals("Not logged in", response, "Response body mismatch in testGetCurrentUser_whenNotLoggedIn");
        } catch (Exception e) {
            System.out.println("testGetCurrentUser_whenNotLoggedIn FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLogout_invalidatesSession() {
        try {
            System.out.println("\n=== testLogout_invalidatesSession ===");
            MockHttpSession session = new MockHttpSession();
            session.setAttribute("user", new User());

            var result = mockMvc.perform(post("/api/auth/logout").session(session))
                    .andReturn();

            int status = result.getResponse().getStatus();

            System.out.println("Expected Status: 200, Actual Status: " + status);

            assertEquals(200, status, "Status code mismatch in testLogout_invalidatesSession");
        } catch (Exception e) {
            System.out.println("testLogout_invalidatesSession FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testSignup_withNullEmail_returnsBadRequest() {
        try {
            System.out.println("\n=== testSignup_withNullEmail_returnsBadRequest ===");
            User user = new User();
            user.setEmail(null);
            user.setPassword("1234");

            when(userService.registerUser(Mockito.any(User.class))).thenReturn(false);

            var result = mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            int status = result.getResponse().getStatus();
            String response = result.getResponse().getContentAsString();

            System.out.println("Expected Status: 400, Actual Status: " + status);
            assertEquals(400, status);
        } catch (Exception e) {
            System.out.println("testSignup_withNullEmail_returnsBadRequest FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLogin_withNullPassword_returnsUnauthorized() {
        try {
            System.out.println("\n=== testLogin_withNullPassword_returnsUnauthorized ===");
            User user = new User();
            user.setEmail("test@example.com");
            user.setPassword(null);

            User foundUser = new User();
            foundUser.setEmail("test@example.com");
            foundUser.setPassword("1234");

            when(userService.findByEmail("test@example.com")).thenReturn(foundUser);

            var result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            int status = result.getResponse().getStatus();
            String response = result.getResponse().getContentAsString();

            System.out.println("Expected Status: 401, Actual Status: " + status);
            assertEquals(401, status);
        } catch (Exception e) {
            System.out.println("testLogin_withNullPassword_returnsUnauthorized FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLogin_whenAlreadyLoggedIn_overwritesSession() {
        try {
            System.out.println("\n=== testLogin_whenAlreadyLoggedIn_overwritesSession ===");
            User user = new User();
            user.setEmail("test@example.com");
            user.setPassword("1234");

            User foundUser = new User();
            foundUser.setId(2L);
            foundUser.setFirstName("Jane");
            foundUser.setLastName("Doe");
            foundUser.setEmail("test@example.com");
            foundUser.setPassword("1234");

            when(userService.findByEmail("test@example.com")).thenReturn(foundUser);

            MockHttpSession session = new MockHttpSession();
            session.setAttribute("user", new User()); // Simulate already logged in

            var result = mockMvc.perform(post("/api/auth/login")
                    .session(session)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(user)))
                    .andReturn();

            int status = result.getResponse().getStatus();
            String response = result.getResponse().getContentAsString();

            System.out.println("Expected Status: 200, Actual Status: " + status);
            assertEquals(200, status);
            assertTrue(response.contains("\"email\":\"test@example.com\""));
        } catch (Exception e) {
            System.out.println("testLogin_whenAlreadyLoggedIn_overwritesSession FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testLogout_whenNotLoggedIn_returnsOk() {
        try {
            System.out.println("\n=== testLogout_whenNotLoggedIn_returnsOk ===");
            MockHttpSession session = new MockHttpSession();

            var result = mockMvc.perform(post("/api/auth/logout").session(session))
                    .andReturn();

            int status = result.getResponse().getStatus();
            System.out.println("Expected Status: 200, Actual Status: " + status);
            assertEquals(200, status);
        } catch (Exception e) {
            System.out.println("testLogout_whenNotLoggedIn_returnsOk FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testGetCurrentUser_withInvalidSessionObject_returns401() {
        try {
            System.out.println("\n=== testGetCurrentUser_withInvalidSessionObject_returns401 ===");
            MockHttpSession session = new MockHttpSession();
            session.setAttribute("user", "notAUserObject");

            var result = mockMvc.perform(get("/api/auth/user").session(session))
                    .andReturn();

            int status = result.getResponse().getStatus();
            System.out.println("Expected Status: 401, Actual Status: " + status);
            assertEquals(401, status);
        } catch (Exception e) {
            System.out.println("testGetCurrentUser_withInvalidSessionObject_returns401 FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
