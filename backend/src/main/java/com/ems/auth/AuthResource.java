package com.ems.auth;

import com.ems.auth.dto.AuthConfigResponse;
import com.ems.auth.dto.AuthResponse;
import com.ems.auth.dto.GoogleLoginRequest;
import com.ems.auth.dto.OtpRequest;
import com.ems.auth.dto.RegisterRequest;
import com.ems.auth.dto.VerifyOtpRequest;
import com.ems.auth.dto.VerifyOtpResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@Path("/api/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @Inject
    Logger log;

    @ConfigProperty(name = "ems.google.enabled", defaultValue = "false")
    boolean googleEnabled;

    @ConfigProperty(name = "ems.google.client-id", defaultValue = "none")
    String googleClientId;

    @GET
    @Path("/config")
    public AuthConfigResponse getAuthConfig() {
        return new AuthConfigResponse(googleEnabled, googleClientId);
    }

    @POST
    @Path("/otp/request")
    public Response requestOtp(@Valid OtpRequest request) {
        log.infof("OTP request for %s", request.email());
        authService.requestOtp(request);
        return Response.ok().build();
    }

    @POST
    @Path("/otp/verify")
    public Response verifyOtp(@Valid VerifyOtpRequest request) {
        log.infof("OTP verification for %s", request.email());
        VerifyOtpResponse response = authService.verifyOtp(request);
        return Response.ok(response).build();
    }

    @POST
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        log.infof("Registration request for hospital %s", request.hospitalName());
        AuthResponse response = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/google")
    public Response googleLogin(@Valid GoogleLoginRequest request) {
        log.info("Google login request");
        VerifyOtpResponse response = authService.verifyGoogleLogin(request.idToken());
        return Response.ok(response).build();
    }
}
