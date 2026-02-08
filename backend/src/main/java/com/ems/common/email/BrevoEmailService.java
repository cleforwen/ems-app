package com.ems.common.email;

import io.quarkus.arc.lookup.LookupIfProperty;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.List;

@ApplicationScoped
@LookupIfProperty(name = "ems.email.strategy", stringValue = "api")
public class BrevoEmailService implements EmailService {

    @Inject
    @RestClient
    BrevoClient brevoClient;

    @ConfigProperty(name = "ems.email.api-key", defaultValue = "none")
    String apiKey;

    @ConfigProperty(name = "quarkus.mailer.from", defaultValue = "no-reply@ems.com")
    String fromEmail;

    @Override
    public void sendText(String to, String subject, String body) {
        if ("none".equals(apiKey)) {
            throw new RuntimeException("Brevo API key is not configured. Set ems.brevo.api-key");
        }

        BrevoClient.BrevoApiRequest request = new BrevoClient.BrevoApiRequest(
                new BrevoClient.Sender("EMS System", fromEmail),
                List.of(new BrevoClient.Recipient(to)),
                subject,
                body);

        brevoClient.sendEmail(apiKey, request);
    }
}
