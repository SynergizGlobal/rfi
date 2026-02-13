package com.metro.rfisystem.backend.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.config.EncryptDecrypt;
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
import com.metro.rfisystem.backend.service.UserService;
import com.metro.rfisystem.backend.util.JwtUtil;

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
	
	@Autowired
	private UserService userService;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
		try {
			
	        String token = loginRequest.getToken();   

			
			
			  if (token != null && !token.isEmpty()) {
			        System.out.println("Received Token: " + token);
			        
			        String userId = JwtUtil.validateToken(token);

			        User user = userService.findById(userId)
			                .orElseThrow(() -> new RuntimeException("User not found"));  
			        
			        loginRequest.setUserId(user.getUserId());
			        
			        EncryptDecrypt passDec = new EncryptDecrypt();
			        
			        String password = passDec.decrypt(user.getPassword());
			        
			        loginRequest.setPassword(password);
			        
			        
			  }
			
			
			logger.info("Login attempt for user: {}", loginRequest.getUserId());

			User user = loginService.authenticate(loginRequest.getUserId(), loginRequest.getPassword());
	        String loginDepartment = loginService.resolveLoginDepartment(user);

			List<AllowedContractDTO> allowedContracts = loginService.getAllowedContractsWithDesignation(user);

			List<ContractDesignationEngineersDTO> designationWithEngineers = loginService
					.getDesignationWithEngineers(user);

			session.setAttribute("user", user);
			session.setAttribute("userId", user.getUserId());
			session.setAttribute("userName", user.getUserName());
			session.setAttribute("emailId", user.getEmailId());
			session.setAttribute("userRoleNameFk", user.getUserRoleNameFk());
			session.setAttribute("userTypeFk", user.getUserTypeFk());
			session.setAttribute("allowedContracts", allowedContracts);
			session.setAttribute("engineerList", designationWithEngineers);
			session.setAttribute("departmentFk", user.getDepartmentFk());
			session.setAttribute("loginDepartment", loginDepartment);
			session.setAttribute("reportingToIdSrfk", user.getReportingToIdSrfk());
			session.setAttribute("designation", user.getDesignation());

			System.out.println("User ID: " + user.getUserId());
			System.out.println("Reporting To: " + user.getReportingToIdSrfk());
			loginService.updateSessionId(user.getUserId(), session.getId());

			LoginResponse response = new LoginResponse(user.getUserId(), user.getUserName(), user.getEmailId(), user.getUserRoleNameFk(),
					user.getUserTypeFk(), loginDepartment, user.getDepartmentFk(), allowedContracts, designationWithEngineers, user.getDesignation());

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
			return ResponseEntity.ok(new LoginResponse(null, null,null,  null, "Logged out successfully", null, null, null, null,null));

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
			LoginResponse response = new LoginResponse(user.getUserId(), user.getUserName(), user.getEmailId(), user.getUserRoleNameFk(),
					user.getDepartmentFk(), "Session active", null, null, null, null);
			return ResponseEntity.ok(response);
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(new ErrorResponse("NO_SESSION", "No active session found"));
		}
	}

	@GetMapping("/regular-roles")
	public ResponseEntity<List<ContractDesignationEngineersDTO>> getRegularEngineers(@RequestParam String userId) {

		Optional<User> users = loginRepo.findById(userId);
		System.out.println("get the username: " + users);


		User user = users.stream().filter(u -> "DyHOD".equalsIgnoreCase(u.getUserTypeFk())).findFirst().orElse(null);

		if (user == null) {
			return ResponseEntity.badRequest().body(Collections.emptyList());
		}

		List<ContractDesignationEngineersDTO> result = loginService.getDesignationWithEngineers(user);
		return ResponseEntity.ok(result);
	}
	

//	@GetMapping("/engineer-names")
//	public ResponseEntity<List<String>> getEngineerNamesForContract(@RequestParam String userId,
//			@RequestParam String contractId) {
//
//		List<User> users = loginRepo.findByUserId(userId);
//		if (users.isEmpty()) {
//			return ResponseEntity.badRequest().body(Collections.emptyList());
//		}
//
//		System.out.println("➡ userName: " + userId);
//		System.out.println("➡ contractId: " + contractId);
//
//		Optional<String> dyHodUserIdOptional = contractRepo.findDyHodUserIdByContractId(contractId);
//		if (!dyHodUserIdOptional.isPresent()) {
//			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
//		}
//
//		String dyHodUserId = dyHodUserIdOptional.get();
//
//	
//		User matchedUser = users.stream().filter(u -> u.getUserId().equals(dyHodUserId)).findFirst().orElse(null);
//
//		if (matchedUser == null) {
//			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
//		}
//
//		List<AllowedContractDTO> allowedContracts = loginService.getAllowedContractsWithDesignation(matchedUser);
//
//		boolean isAllowed = allowedContracts.stream().anyMatch(c -> c.getContractId().equals(contractId));
//
//		if (!isAllowed) {
//			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
//		}
//
//		List<String> engineers = contractExecutiveRepo.findEngineeringUsernamesByContractId(contractId);
//		return ResponseEntity.ok(engineers);
//	}

	
	
	@GetMapping("/engineer-names")
	public ResponseEntity<List<String>> getEngineerNamesForContract(
	        @RequestParam String userId,
	        @RequestParam String contractId) {

	    List<User> users = loginRepo.findByUserId(userId);
	    if (users.isEmpty()) {
	        return ResponseEntity.badRequest().body(Collections.emptyList());
	    }

	    User loggedInUser = users.get(0);
	    String role = loggedInUser.getUserRoleNameFk();

	    // ✅ Allow Data Admin or IT Admin full access
	    if ("Data Admin".equalsIgnoreCase(role) || "IT Admin".equalsIgnoreCase(role)) {
	        List<String> engineers = contractExecutiveRepo.findEngineeringUsernamesByContractId(contractId);
	        return ResponseEntity.ok(engineers);
	    }

	    // ⬇️ For other users: continue DyHOD-based validation
	    Optional<String> dyHodUserIdOptional = contractRepo.findDyHodUserIdByContractId(contractId);
	    if (!dyHodUserIdOptional.isPresent()) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
	    }

	    String dyHodUserId = dyHodUserIdOptional.get();
	    User matchedUser = users.stream()
	            .filter(u -> u.getUserId().equals(dyHodUserId))
	            .findFirst()
	            .orElse(null);

	    if (matchedUser == null) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
	    }

	    List<AllowedContractDTO> allowedContracts = loginService.getAllowedContractsWithDesignation(matchedUser);
	    boolean isAllowed = allowedContracts.stream().anyMatch(c -> c.getContractId().equals(contractId));

	    if (!isAllowed) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
	    }

	    List<String> engineers = contractExecutiveRepo.findEngineeringUsernamesByContractId(contractId);
	    return ResponseEntity.ok(engineers);
	}
	
	
	
	@GetMapping("/setsession")
	public ResponseEntity<?> setsession(@RequestParam("token") String token,
	                                    HttpSession session) {

	    try {

	        String userId = JwtUtil.validateToken(token);

	        User user = userService.findById(userId)
	                .orElseThrow(() -> new RuntimeException("User not found"));

	        UsernamePasswordAuthenticationToken auth =
	                new UsernamePasswordAuthenticationToken(user, null, new ArrayList<>());

	        SecurityContextHolder.getContext().setAuthentication(auth);

	        session.setAttribute(
	                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
	                SecurityContextHolder.getContext()
	        );

	        String loginDepartment = loginService.resolveLoginDepartment(user);

	        List<AllowedContractDTO> allowedContracts =
	                loginService.getAllowedContractsWithDesignation(user);

	        List<ContractDesignationEngineersDTO> designationWithEngineers =
	                loginService.getDesignationWithEngineers(user);

	        session.setAttribute("user", user);
	        session.setAttribute("userId", user.getUserId());
	        session.setAttribute("userName", user.getUserName());
	        session.setAttribute("emailId", user.getEmailId());
	        session.setAttribute("userRoleNameFk", user.getUserRoleNameFk());
	        session.setAttribute("userTypeFk", user.getUserTypeFk());
	        session.setAttribute("allowedContracts", allowedContracts);
	        session.setAttribute("engineerList", designationWithEngineers);
	        session.setAttribute("departmentFk", user.getDepartmentFk());
	        session.setAttribute("loginDepartment", loginDepartment);
	        session.setAttribute("reportingToIdSrfk", user.getReportingToIdSrfk());
	        session.setAttribute("designation", user.getDesignation());

	        loginService.updateSessionId(user.getUserId(), session.getId());

	        LoginResponse response = new LoginResponse(
	                user.getUserId(),
	                user.getUserName(),
	                user.getEmailId(),
	                user.getUserRoleNameFk(),
	                user.getUserTypeFk(),
	                loginDepartment,
	                user.getDepartmentFk(),
	                allowedContracts,
	                designationWithEngineers,
	                user.getDesignation()
	        );

	        return ResponseEntity.ok(response);

	    } catch (Exception e) {

	        session.invalidate();
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
	    }
	}

	  
	  @GetMapping("/getsession")
	  public Boolean getsession(HttpSession session) {

	      User user = (User) session.getAttribute("user");
	      return user != null;
	  }
	  

// clearing the session before the login
	  @GetMapping("/clearsession")
	  public ResponseEntity<?> clearSession(HttpSession session) {

	      try {
	          session.invalidate();   
	          SecurityContextHolder.clearContext(); 

	          return ResponseEntity.ok("Session cleared");

	      } catch (Exception e) {
	          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                  .body("Failed to clear session");
	      }
	  }




}
