package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class NewPasswordRequest {
	private String emailId;
	private String newPassword;

}
