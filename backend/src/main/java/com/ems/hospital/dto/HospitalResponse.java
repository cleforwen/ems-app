package com.ems.hospital.dto;

public record HospitalResponse(
        Long id,
        String name,
        String code,
        String address,
        String phone,
        String email,
        Boolean active) {
}
