package com.metro.rfisystem.backend.service;

public interface ForgotPasswordService {

	void sendOtp(String email);

	boolean verifyOtp(String email, String otp);

	void updatePassword(String email, String newPassword);

}
