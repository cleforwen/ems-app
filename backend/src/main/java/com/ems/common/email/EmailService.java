package com.ems.common.email;

public interface EmailService {
    void sendText(String to, String subject, String body);
}
