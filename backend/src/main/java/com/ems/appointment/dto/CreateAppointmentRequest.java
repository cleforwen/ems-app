package com.ems.appointment.dto;

import com.ems.appointment.Appointment;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateAppointmentRequest(
        @NotNull(message = "Patient ID is required") Long patientId,

        @NotNull(message = "Doctor ID is required") Long doctorId,

        @NotNull(message = "Appointment date is required") LocalDate appointmentDate,

        @NotNull(message = "Start time is required") LocalTime startTime,

        @NotNull(message = "End time is required") LocalTime endTime,

        Appointment.Type type,
        String reason,
        String notes) {
}
