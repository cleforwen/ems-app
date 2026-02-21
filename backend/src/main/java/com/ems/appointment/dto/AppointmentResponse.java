package com.ems.appointment.dto;

import com.ems.appointment.Appointment;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentResponse(
        Long id,
        Long patientId,
        String patientName,
        String patientMrn,
        Long doctorId,
        String doctorName,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,
        Appointment.Status status,
        Appointment.Type type,
        String reason,
        String notes) {
}
