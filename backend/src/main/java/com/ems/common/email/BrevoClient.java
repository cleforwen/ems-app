package com.ems.common.email;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@Path("/v3/smtp/email")
@RegisterRestClient(configKey = "brevo-api")
public interface BrevoClient {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    void sendEmail(@HeaderParam("api-key") String apiKey, BrevoApiRequest request);

    record BrevoApiRequest(Sender sender, List<Recipient> to, String subject, String textContent) {
    }

    record Sender(String name, String email) {
    }

    record Recipient(String email) {
    }
}
