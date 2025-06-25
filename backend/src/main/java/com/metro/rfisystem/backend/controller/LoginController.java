package com.metro.rfisystem.backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.ErrorResponse;
import com.metro.rfisystem.backend.dto.LoginRequest;
import com.metro.rfisystem.backend.dto.LoginResponse;
import com.metro.rfisystem.backend.exception.AuthenticationException;
import com.metro.rfisystem.backend.exception.UserNotFoundException;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.service.LoginService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:9090", allowCredentials = "true")
public class LoginController {

	private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

	@Autowired
	private LoginService loginService;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
		try {
			logger.info("Login attempt for user: {}", loginRequest.getUserName());

			User user = loginService.authenticate(loginRequest.getUserName(), loginRequest.getPassword());

			session.setAttribute("user", user);
			session.setAttribute("userId", user.getUserId());
			session.setAttribute("userName", user.getUserName());
			session.setAttribute("userRoleNameFk", user.getUserRoleNameFk());
			session.setAttribute("userTypeFk", user.getUserTypeFk());

			loginService.updateSessionId(user.getUserId(), session.getId());

			LoginResponse response = new LoginResponse(user.getUserId(), user.getUserName(), user.getUserRoleNameFk(),
					user.getUserTypeFk());

			logger.info("Login successful for user: {}", user.getUserName());
			return ResponseEntity.ok(response);

		} catch (AuthenticationException e) {
			logger.warn("Authentication failed: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new ErrorResponse("AUTHENTICATION_FAILED", e.getMessage()));

		} catch (UserNotFoundException e) {
			logger.warn("User not found: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("message", "Invalid username or password"));

		} catch (Exception e) {
			logger.error("Unexpected error during login", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
		}
	}

	@GetMapping("/logout")
	public ResponseEntity<?> logout(HttpSession session) {
		try {
			String userName = (String) session.getAttribute("userName");
			session.invalidate();

			logger.info("Logout successful for user: {}", userName);
			return ResponseEntity.ok(new LoginResponse(null, null, null, "Logged out successfully"));

		} catch (Exception e) {
			logger.error("Error during logout", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ErrorResponse("LOGOUT_ERROR", "Error occurred during logout"));
		}
	}

	@GetMapping("/session")
	public ResponseEntity<?> checkSession(HttpSession session) {
		User user = (User) session.getAttribute("user");

		if (user != null) {
			LoginResponse response = new LoginResponse(user.getUserId(), user.getUserName(), user.getUserRoleNameFk(),
					"Session active");
			return ResponseEntity.ok(response);
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new ErrorResponse("NO_SESSION", "No active session found"));
		}
	}

	@GetMapping("/regular-roles")
	public ResponseEntity<List<String>> getUserNamesOfRegularUsers() {
		List<String> userNames = loginService.getUserNamesOfRegularUsers();
		return ResponseEntity.ok(userNames);
	}

}
