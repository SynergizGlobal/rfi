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
	        try {
	            forgotPasswordService.updatePassword(request.getEmailId(), request.getNewPassword(), request.getConfirmPassword());
	            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                    .body(Map.of("message", "Password reset failed", "error", e.getMessage()));
	        }
	    }


}
