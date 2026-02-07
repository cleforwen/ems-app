package com.ems.patient.dto;

import com.ems.patient.Patient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreatePatientRequest(
        @NotBlank(message = "MRN is required") String mrn,

        @NotBlank(message = "First name is required") String firstName,

        @NotBlank(message = "Last name is required") String lastName,

        @NotNull(message = "Date of Birth is required") LocalDate dateOfBirth,

        Patient.Gender gender,
        String phone,
        String email,
        String address,
        String emergencyContact,
        String bloodType,
        Long assignedDoctorId) {
}
