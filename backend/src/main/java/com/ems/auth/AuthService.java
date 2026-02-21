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

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;

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

    @Inject
    JWTParser jwtParser;

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

            List<User> users = userRepository.listByEmail(email);
            if (!users.isEmpty()) {
                // Return global token and available hospitals
                String globalToken = generateGlobalToken(email);
                List<HospitalInfo> hospitals = users.stream()
                        .filter(User::getActive)
                        .map(u -> new HospitalInfo(u.getHospital().getId(), u.getHospital().getName(),
                                u.getRoles().stream().map(Enum::name).collect(Collectors.toSet())))
                        .collect(Collectors.toList());
                return new VerifyOtpResponse(globalToken, false, email, hospitals);
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
        List<User> users = userRepository.listByEmail(request.email());
        boolean consume = !users.isEmpty();

        boolean isValid = otpService.validateOtp(request.email(), request.otp(), consume);
        if (!isValid) {
            throw new WebApplicationException("Invalid or expired OTP", Response.Status.UNAUTHORIZED);
        }

        if (!users.isEmpty()) {
            String globalToken = generateGlobalToken(request.email());
            List<HospitalInfo> hospitals = users.stream()
                    .filter(User::getActive)
                    .map(u -> new HospitalInfo(u.getHospital().getId(), u.getHospital().getName(),
                            u.getRoles().stream().map(Enum::name).collect(Collectors.toSet())))
                    .collect(Collectors.toList());
            return new VerifyOtpResponse(globalToken, false, request.email(), hospitals);
        } else {
            return new VerifyOtpResponse(generateGlobalToken(request.email()), true, request.email(), null);
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate Token
        String email;
        try {
            email = validateGlobalToken(request.globalToken());
        } catch (Exception e) {
            throw new WebApplicationException("Invalid global token", Response.Status.UNAUTHORIZED);
        }

        if (!request.email().equals(email)) {
            throw new WebApplicationException("Email mismatch", Response.Status.UNAUTHORIZED);
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

    public AuthResponse exchangeToken(String globalToken, Long hospitalId) {
        String email;
        try {
            email = validateGlobalToken(globalToken);
        } catch (Exception e) {
            throw new WebApplicationException("Invalid global token", Response.Status.UNAUTHORIZED);
        }

        List<User> users = userRepository.listByEmail(email);
        User targetUser = users.stream()
                .filter(u -> u.getHospital().getId().equals(hospitalId))
                .findFirst()
                .orElseThrow(
                        () -> new WebApplicationException("Not a member of this hospital", Response.Status.FORBIDDEN));

        if (!targetUser.getActive() || !targetUser.getHospital().getActive()) {
            throw new WebApplicationException("Account or hospital is disabled", Response.Status.FORBIDDEN);
        }

        return generateAuthResponse(targetUser);
    }

    public List<HospitalInfo> listUserHospitals(String email) {
        return userRepository.listByEmail(email).stream()
                .filter(User::getActive)
                .map(u -> new HospitalInfo(u.getHospital().getId(), u.getHospital().getName(),
                        u.getRoles().stream().map(Enum::name).collect(Collectors.toSet())))
                .collect(Collectors.toList());
    }

    private String generateGlobalToken(String email) {
        return Jwt.issuer(issuer)
                .upn(email)
                .subject(email)
                .claim("tokenType", "GLOBAL")
                .expiresIn(3600) // 1 hour
                .sign();
    }

    private String validateGlobalToken(String token) throws ParseException {
        var jwt = jwtParser.parse(token);
        String type = jwt.getClaim("tokenType");
        if (!"GLOBAL".equals(type) && !"HOSPITAL".equals(type)) {
            throw new WebApplicationException("Invalid token type", Response.Status.UNAUTHORIZED);
        }
        return jwt.getName();
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
                .claim("tokenType", "HOSPITAL")
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
