package com.ems.dashboard.dto;

import com.ems.appointment.dto.AppointmentResponse;
import com.ems.patient.dto.LabResultResponse;
import com.ems.patient.dto.PatientResponse;
import java.util.List;

public record DashboardResponse(
        long totalPatients,
        long totalActiveDiagnoses,
        long appointmentsToday,
        long appointmentsRemaining,
        List<AppointmentResponse> upcomingAppointments,
        List<PatientResponse> myPatients,
        List<LabResultResponse> recentLabResults) {
}
