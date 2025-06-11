package com.metro.rfisystem.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.ForgotPasswordRequest;
import com.metro.rfisystem.backend.dto.NewPasswordRequest;
import com.metro.rfisystem.backend.dto.OtpVerificationRequest;
import com.metro.rfisystem.backend.service.ForgotPasswordService;

@RestController
@RequestMapping("/api/forgot")
@CrossOrigin(origins = "http://localhost:9090", allowCredentials = "true")
public class ForgotPasswordController {
	
	 @Autowired
	    private ForgotPasswordService forgotPasswordService;

	    @PostMapping("/send-otp")
	    public ResponseEntity<?> sendOtp(@RequestBody ForgotPasswordRequest request) {
	        forgotPasswordService.sendOtp(request.getEmailId());
	        return ResponseEntity.ok(Map.of("message", "OTP sent to email"));
	    }

	    @PostMapping("/verify-otp")
	    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
	        boolean isValid = forgotPasswordService.verifyOtp(request.getEmailId(), request.getOtp());
	        if (isValid) {
	            return ResponseEntity.ok(Map.of("message", "OTP verified"));
	        } else {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(Map.of("message", "Invalid OTP"));
	        }
	    }

	    @PostMapping("/reset-password")
	    public ResponseEntity<?> resetPassword(@RequestBody NewPasswordRequest request) {
	        forgotPasswordService.updatePassword(request.getEmailId(), request.getNewPassword());
	        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
	    }

}
