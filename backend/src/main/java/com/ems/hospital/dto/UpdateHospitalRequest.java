package com.ems.hospital.dto;

public record UpdateHospitalRequest(
        String name,
        String address,
        String phone,
        String email,
        Boolean active) {
}
