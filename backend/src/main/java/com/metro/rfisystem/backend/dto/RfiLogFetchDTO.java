package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RfiLogFetchDTO {

	private String userRole;
	private String userName;
	private String userId;
	private String userType;
	private String deparmentFK;
	private String project;
	private String work;
	private String contract;

}
