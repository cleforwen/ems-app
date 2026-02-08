package com.ems.auth;

import com.ems.common.email.EmailService;
import com.ems.auth.dto.*;
import com.ems.hospital.Hospital;
import com.ems.hospital.HospitalRepository;
import com.ems.user.Role;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    HospitalRepository hospitalRepository;

    @Inject
    OtpService otpService;

    @Inject
    EmailService emailService;

    @Inject
    GoogleAuthService googleAuthService;

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    public void requestOtp(OtpRequest request) {
        String otp = otpService.generateOtp(request.email());

        // Send email (SMTP or API depending on profile)
        emailService.sendText(request.email(), "Your OTP Code", "Your OTP code is: " + otp);

        System.out.println("OTP for " + request.email() + ": " + otp); // For dev/demo purposes
    }

    public VerifyOtpResponse verifyGoogleLogin(String idToken) {
        try {
            var payload = googleAuthService.verifyToken(idToken);
            String email = payload.getEmail();

            var userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                if (!user.getActive()) {
                    throw new WebApplicationException("Account is disabled", Response.Status.FORBIDDEN);
                }
                AuthResponse auth = generateAuthResponse(user);
                return new VerifyOtpResponse(auth.token(), false, email, auth);
            } else {
                // New user - return metadata for registration
                return new VerifyOtpResponse(null, true, email, null);
            }
        } catch (Exception e) {
            throw new WebApplicationException("Google Authentication failed: " + e.getMessage(),
                    Response.Status.UNAUTHORIZED);
        }
    }

    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        // Validate but do NOT consume if new user (so they can register)
        // Check if user exists first
        var userOptional = userRepository.findByEmail(request.email());
        boolean consume = userOptional.isPresent();

        boolean isValid = otpService.validateOtp(request.email(), request.otp(), consume);
        if (!isValid) {
            throw new WebApplicationException("Invalid or expired OTP", Response.Status.UNAUTHORIZED);
        }

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (!user.getActive()) {
                throw new WebApplicationException("Account is disabled", Response.Status.FORBIDDEN);
            }
            AuthResponse auth = generateAuthResponse(user);
            return new VerifyOtpResponse(auth.token(), false, request.email(), auth);
        } else {
            return new VerifyOtpResponse(null, true, request.email(), null);
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate and Consume OTP
        if (!"GOOGLE".equals(request.otp())) {
            boolean isValid = otpService.validateOtp(request.email(), request.otp(), true);
            if (!isValid) {
                throw new WebApplicationException("Invalid or expired OTP", Response.Status.UNAUTHORIZED);
            }
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new WebApplicationException("User already exists", Response.Status.CONFLICT);
        }

        // Create Hospital
        Hospital hospital = new Hospital();
        hospital.setName(request.hospitalName());
        hospital.setCode(generateHospitalCode(request.hospitalName()));
        hospital.setActive(true);
        hospital.setCreatedBy("system");
        hospitalRepository.persist(hospital);

        // Create Admin User
        User user = new User();
        user.setHospital(hospital);
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setRoles(Set.of(Role.ADMIN));
        user.setActive(true);
        user.setCreatedBy("system");
        userRepository.persist(user);

        return generateAuthResponse(user);
    }

    private String generateHospitalCode(String name) {
        return name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase().substring(0, Math.min(5, name.length()))
                + "-" + System.currentTimeMillis() % 10000;
    }

    private AuthResponse generateAuthResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        String token = Jwt.issuer(issuer)
                .upn(user.getEmail())
                .subject(user.getEmail())
                .claim("hospitalId", user.getHospital().getId())
                .claim("userId", user.getId())
                .groups(roles)
                .expiresIn(3600 * 12)
                .sign();

        return new AuthResponse(
                token,
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getHospital().getId(),
                user.getHospital().getName(),
                roles);
    }
}
