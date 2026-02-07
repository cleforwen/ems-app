package com.ems.patient.dto;

import com.ems.patient.Patient;
import java.time.LocalDate;

public record UpdatePatientRequest(
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        Patient.Gender gender,
        String phone,
        String email,
        String address,
        String emergencyContact,
        String bloodType,
        Long assignedDoctorId,
        Boolean active) {
}
