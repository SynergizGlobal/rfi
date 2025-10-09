package com.metro.rfisystem.backend.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class EsignWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendStatusUpdate(String txnId, String status, String message) {
        // 🔔 Publish to frontend listening on /topic/esign/{txnId}
        messagingTemplate.convertAndSend("/topic/esign/" + txnId,
            new EsignMessage(status, message));
    }

    // Simple DTO for message
    public static class EsignMessage {
        private String status;
        private String message;

        public EsignMessage(String status, String message) {
            this.status = status;
            this.message = message;
        }

        public String getStatus() { return status; }
        public String getMessage() { return message; }
    }
}
