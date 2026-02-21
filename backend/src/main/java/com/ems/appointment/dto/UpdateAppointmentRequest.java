package com.ems.appointment.dto;

import com.ems.appointment.Appointment;
import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateAppointmentRequest(
        Long patientId,
        Long doctorId,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,
        Appointment.Status status,
        Appointment.Type type,
        String reason,
        String notes) {
}
