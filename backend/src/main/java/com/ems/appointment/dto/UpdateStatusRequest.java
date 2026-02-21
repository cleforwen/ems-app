package com.ems.appointment.dto;

import com.ems.appointment.Appointment;

public record UpdateStatusRequest(
        Appointment.Status status) {
}
