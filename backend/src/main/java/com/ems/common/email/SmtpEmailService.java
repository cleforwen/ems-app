package com.ems.common.email;

import io.quarkus.arc.DefaultBean;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
@DefaultBean
public class SmtpEmailService implements EmailService {

    @Inject
    Mailer mailer;

    @Override
    public void sendText(String to, String subject, String body) {
        mailer.send(Mail.withText(to, subject, body));
    }
}
