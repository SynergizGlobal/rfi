package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class NewPasswordRequest {
	private String newPassword;
	private String confirmPassword;
	private String emailId;

}
