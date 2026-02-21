package com.ems.hospital.dto;

public record UpdateHospitalRequest(
                String name,
                String address,
                String city,
                String state,
                String zip,
                String phone,
                String email,
                String website,
                Boolean active) {
}
