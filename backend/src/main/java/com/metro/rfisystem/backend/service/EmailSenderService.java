package com.metro.rfisystem.backend.service;

public interface EmailSenderService {
    void sendEmail(String toEmail, String subject, String body);


}
