package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.model.pmis.User;

public interface LoginService {

	User authenticate(String username, String password) throws Exception;

	void updateSessionId(String userId, String sessionId);

	boolean isValidUser(String userName);
	
	List<String> getUserNamesOfRegularUsers();
}
