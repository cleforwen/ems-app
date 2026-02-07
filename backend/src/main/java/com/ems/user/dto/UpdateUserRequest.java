package com.ems.user.dto;

import com.ems.user.Role;
import java.util.Set;

public record UpdateUserRequest(
                String firstName,
                String lastName,

                Set<Role> roles,
                Boolean active) {
}
