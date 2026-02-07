package com.ems.auth;

import jakarta.enterprise.context.ApplicationScoped;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class OtpService {

    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public String generateOtp(String email) {
        String code = String.format("%06d", random.nextInt(1000000));
        otpStorage.put(email, new OtpEntry(code, LocalDateTime.now().plusMinutes(5)));
        return code;
    }

    public boolean validateOtp(String email, String code) {
        return validateOtp(email, code, true);
    }

    public boolean validateOtp(String email, String code, boolean consume) {
        OtpEntry entry = otpStorage.get(email);
        if (entry == null) {
            return false;
        }

        if (entry.expiry.isBefore(LocalDateTime.now())) {
            otpStorage.remove(email);
            return false;
        }

        if (entry.code.equals(code)) {
            if (consume) {
                otpStorage.remove(email);
            }
            return true;
        }

        return false;
    }

    private record OtpEntry(String code, LocalDateTime expiry) {
    }
}
