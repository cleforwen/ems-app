package com.ems.hospital.dto;

public record HospitalResponse(
        Long id,
        String name,
        String code,
        String address,
        String city,
        String state,
        String zip,
        String phone,
        String email,
        String website,
        Boolean active,
        Boolean appointmentsEnabled) {
}
