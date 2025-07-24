package com.metro.rfisystem.backend.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.AllowedContractDTO;
import com.metro.rfisystem.backend.dto.ContractDesignationEngineersDTO;
import com.metro.rfisystem.backend.dto.ErrorResponse;
import com.metro.rfisystem.backend.dto.LoginRequest;
import com.metro.rfisystem.backend.dto.LoginResponse;
import com.metro.rfisystem.backend.exception.AuthenticationException;
import com.metro.rfisystem.backend.exception.UserNotFoundException;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.repository.pmis.ContractExecutiveRepository;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.LoginRepository;
import com.metro.rfisystem.backend.service.LoginService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

	private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

	@Autowired
	private LoginService loginService;

	@Autowired
	private LoginRepository loginRepo;

	@Autowired
	private ContractRepository contractRepo;

	@Autowired
	private ContractExecutiveRepository contractExecutiveRepo;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
		try {
			logger.info("Login attempt for user: {}", loginRequest.getUserName());

			User user = loginService.authenticate(loginRequest.getUserName(), loginRequest.getPassword());
	        String loginDepartment = loginService.resolveLoginDepartment(user);

			List<AllowedContractDTO> allowedContracts = loginService.getAllowedContractsWithDesignation(user);

			List<ContractDesignationEngineersDTO> designationWithEngineers = loginService
					.getDesignationWithEngineers(user);

			session.setAttribute("user", user);
			session.setAttribute("userId", user.getUserId());
			session.setAttribute("userName", user.getUserName());
			session.setAttribute("userRoleNameFk", user.getUserRoleNameFk());
			session.setAttribute("userTypeFk", user.getUserTypeFk());
			session.setAttribute("allowedContracts", allowedContracts);
			session.setAttribute("engineerList", designationWithEngineers);
			session.setAttribute("departmentFk", user.getDepartmentFk());
			session.setAttribute("loginDepartment", loginDepartment);
			
			loginService.updateSessionId(user.getUserId(), session.getId());

			LoginResponse response = new LoginResponse(user.getUserId(), user.getUserName(), user.getUserRoleNameFk(),
					user.getUserTypeFk(), loginDepartment, user.getDepartmentFk(), allowedContracts, designationWithEngineers);

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
			return ResponseEntity.ok(new LoginResponse(null, null, null, "Logged out successfully", null, null, null, null));

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
					user.getDepartmentFk(), "Session active", null, null, null);
			return ResponseEntity.ok(response);
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new ErrorResponse("NO_SESSION", "No active session found"));
		}
	}

	@GetMapping("/regular-roles")
	public ResponseEntity<List<ContractDesignationEngineersDTO>> getRegularEngineers(@RequestParam String userName) {

		List<User> users = loginRepo.findByUserName(userName);
		System.out.println("get the username: " + users);

		// 🛠 Fix: Find the correct user (e.g., DyHOD or specific designation)
		User user = users.stream().filter(u -> "DyHOD".equalsIgnoreCase(u.getUserTypeFk())).findFirst().orElse(null);

		if (user == null) {
			return ResponseEntity.badRequest().body(Collections.emptyList());
		}

		List<ContractDesignationEngineersDTO> result = loginService.getDesignationWithEngineers(user);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/engineer-names")
	public ResponseEntity<List<String>> getEngineerNamesForContract(@RequestParam String userName,
			@RequestParam String contractId) {

		List<User> users = loginRepo.findByUserName(userName);
		if (users.isEmpty()) {
			return ResponseEntity.badRequest().body(Collections.emptyList());
		}

		System.out.println("➡ userName: " + userName);
		System.out.println("➡ contractId: " + contractId);

		// Step 1: Get dyHodUserIdFk from contract table
		Optional<String> dyHodUserIdOptional = contractRepo.findDyHodUserIdByContractId(contractId);
		if (!dyHodUserIdOptional.isPresent()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
		}

		String dyHodUserId = dyHodUserIdOptional.get();

		// Step 2: Match with the correct user (by user_id)
		User matchedUser = users.stream().filter(u -> u.getUserId().equals(dyHodUserId)).findFirst().orElse(null);

		if (matchedUser == null) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
		}

		// Step 3: Check if the user has access to the contract
		List<AllowedContractDTO> allowedContracts = loginService.getAllowedContractsWithDesignation(matchedUser);

		boolean isAllowed = allowedContracts.stream().anyMatch(c -> c.getContractId().equals(contractId));

		if (!isAllowed) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
		}

		// Step 4: Return engineers list
		List<String> engineers = contractExecutiveRepo.findEngineeringUsernamesByContractId(contractId);
		return ResponseEntity.ok(engineers);
	}

}
