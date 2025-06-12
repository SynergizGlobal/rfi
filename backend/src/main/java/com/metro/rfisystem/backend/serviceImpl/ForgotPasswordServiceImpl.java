package com.metro.rfisystem.backend.serviceImpl;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.config.EncryptDecrypt;
import com.metro.rfisystem.backend.exception.UserNotFoundException;
import com.metro.rfisystem.backend.model.User;
import com.metro.rfisystem.backend.repository.LoginRepository;
import com.metro.rfisystem.backend.service.EmailSenderService;
import com.metro.rfisystem.backend.service.ForgotPasswordService;

@Service
public class ForgotPasswordServiceImpl implements ForgotPasswordService{
	
	@Autowired
    private LoginRepository loginRepo;
	
	

    @Autowired
    private EmailSenderService emailSenderService;
    
    private String lastVerifiedEmail = null;


    private Map<String, String> otpStore = new HashMap<>();
    

    @Override
    public void sendOtp(String email) {
        Optional<User> userOpt = loginRepo.findByEmailId(email);
        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("No user found with email: " + email);
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        otpStore.put(email, otp);

        String subject = "Your OTP for Password Reset";
        String body = "<p>Hello,</p><p>Your OTP is: <b>" + otp + "</b></p><p>This OTP is valid for 10 minutes.</p>";

        emailSenderService.sendEmail(email, subject, body);
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        return otp.equals(otpStore.get(email));
    }
    private Set<String> verifiedEmails = new HashSet<>();

    
    @Override
    public void updatePassword(String email, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        Optional<User> userOpt = loginRepo.findByEmailId(email);
        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("No user found with email: " + email);
        }

        User user = userOpt.get();

        try {
            String encryptedPassword = EncryptDecrypt.encrypt(newPassword);
            user.setPassword(encryptedPassword);
            user.setIsPasswordEncrypted("true"); // Optional: if you track encryption
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting password", e);
        }

        loginRepo.save(user);
        otpStore.remove(email);
    }



}
