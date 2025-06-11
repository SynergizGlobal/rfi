package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class OtpVerificationRequest {
	private String emailId;
	private String otp;

}
