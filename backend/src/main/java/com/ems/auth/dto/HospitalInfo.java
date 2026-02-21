package com.ems.auth.dto;

import java.util.Set;

public record HospitalInfo(
        Long id,
        String name,
        Set<String> roles) {
}
