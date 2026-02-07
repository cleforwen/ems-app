package com.ems.user.dto;

import com.ems.user.Role;
import java.util.Set;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        Set<Role> roles,
        Boolean active) {
}
