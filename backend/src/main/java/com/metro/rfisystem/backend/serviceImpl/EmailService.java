
package com.metro.rfisystem.backend.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RfiValidation;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")   // 👈 always from this account
    private String fromEmail;

    public void sendValidationMail(RFI rfi, RfiValidation validation) {
        String to = rfi.getEmailUser();  // 👈 contractor’s email

        if (to == null || to.isBlank()) {
            throw new RuntimeException("No contractor email for RFI ID: " + rfi.getId());
        }
        String contractorName = rfi.getCreatedBy();
        if (contractorName == null || contractorName.isBlank()) {
            contractorName = "Contractor"; // fallback
        }


        String subject = "RFI Validation Update - RFI ID: " + rfi.getRfi_Id();

        String body = String.format(
                "Dear %s,\n\n" +
            "Your RFI (ID: %s) has been validated.\n\n" +
            "Status : %s\n" +
            "Remarks: %s\n\n" +
            "comment: %s\n\n"+
            "Regards,\nMRVC Team",
            contractorName,
            rfi.getRfi_Id(),
            validation.getEnumValidation(),
            validation.getRemarks(),
            validation.getComment()
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);  
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
