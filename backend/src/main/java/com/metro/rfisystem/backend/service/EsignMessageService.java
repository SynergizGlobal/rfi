package com.metro.rfisystem.backend.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
@Service
public class EsignMessageService {
    private final Map<String, String> messages = new ConcurrentHashMap<>();
    
    public void saveMessage(String txnId, String message) {
        messages.put(txnId, message);
    }
    
    public String getMessage(String txnId) {
        return messages.getOrDefault(txnId, "Pending");
    }
}
