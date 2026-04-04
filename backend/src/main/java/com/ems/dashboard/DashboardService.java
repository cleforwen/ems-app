package com.ems.dashboard;

import com.ems.appointment.Appointment;
import com.ems.appointment.AppointmentRepository;
import com.ems.appointment.dto.AppointmentResponse;
import com.ems.dashboard.dto.DashboardResponse;
import com.ems.patient.Diagnosis;
import com.ems.patient.LabResult;
import com.ems.patient.Patient;
import com.ems.patient.dto.LabResultResponse;
import com.ems.patient.dto.PatientResponse;
import com.ems.patient.repository.DiagnosisRepository;
import com.ems.patient.repository.LabResultRepository;
import com.ems.patient.repository.PatientRepository;
import com.ems.user.Role;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class DashboardService {

    @Inject
    PatientRepository patientRepository;
    @Inject
    AppointmentRepository appointmentRepository;
    @Inject
    DiagnosisRepository diagnosisRepository;
    @Inject
    LabResultRepository labResultRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    JsonWebToken jwt;
    @Inject
    Logger log;

    public DashboardResponse getDashboard() {
        Long hospitalId = getHospitalId();
        LocalDate today = LocalDate.now();
        log.debugf("Fetching dashboard for hospital %d", hospitalId);

        // Total patients
        long totalPatients = patientRepository.count("hospital.id = ?1 and active = true", hospitalId);

        // Active diagnoses (ACTIVE or CHRONIC)
        long totalActiveDiagnoses = diagnosisRepository.count(
                "patient.hospital.id = ?1 and (status = ?2 or status = ?3)",
                hospitalId, Diagnosis.Status.ACTIVE, Diagnosis.Status.CHRONIC);

        // Today's appointments
        long appointmentsToday = appointmentRepository.countByDateAndHospitalId(today, hospitalId);

        // Remaining appointments today (not completed/cancelled/no-show)
        long appointmentsRemaining = appointmentRepository.countByDateAndStatusNotAndHospitalId(today, hospitalId);

        // Upcoming appointments (next 5)
        Long userId = getUserId();
        User currentUser = userId != null ? userRepository.findById(userId) : null;
        boolean isDoctor = currentUser != null && currentUser.getRoles().contains(Role.DOCTOR);

        List<AppointmentResponse> upcomingAppointments;
        if (isDoctor) {
            upcomingAppointments = appointmentRepository
                    .findUpcomingByDoctorId(userId, today, hospitalId, 5)
                    .stream().map(this::toAppointmentResponse).collect(Collectors.toList());
        } else {
            upcomingAppointments = appointmentRepository
                    .findUpcomingByHospitalId(today, hospitalId, 5)
                    .stream().map(this::toAppointmentResponse).collect(Collectors.toList());
        }

        // My patients (for doctors)
        List<PatientResponse> myPatients;
        if (isDoctor) {
            myPatients = patientRepository
                    .list("assignedDoctor.id = ?1 and hospital.id = ?2 and active = true", userId, hospitalId)
                    .stream().map(this::toPatientResponse).collect(Collectors.toList());
        } else {
            myPatients = Collections.emptyList();
        }

        // Recent lab results (latest 10 for the hospital)
        List<LabResultResponse> recentLabResults = labResultRepository
                .find("patient.hospital.id = ?1 order by performedAt desc", hospitalId)
                .page(0, 10)
                .list()
                .stream().map(this::toLabResultResponse).collect(Collectors.toList());

        return new DashboardResponse(
                totalPatients,
                totalActiveDiagnoses,
                appointmentsToday,
                appointmentsRemaining,
                upcomingAppointments,
                myPatients,
                recentLabResults);
    }

    private Long getHospitalId() {
        Object claim = jwt.getClaim("hospitalId");
        if (claim == null) {
            throw new WebApplicationException("Invalid token: missing hospitalId", Response.Status.UNAUTHORIZED);
        }
        return Long.parseLong(claim.toString());
    }

    private Long getUserId() {
        Object claim = jwt.getClaim("userId");
        return claim != null ? Long.parseLong(claim.toString()) : null;
    }

    private AppointmentResponse toAppointmentResponse(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getPatient().getId(),
                a.getPatient().getFirstName() + " " + a.getPatient().getLastName(),
                a.getPatient().getMrn(),
                a.getDoctor().getId(),
                a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName(),
                a.getAppointmentDate(),
                a.getStartTime(),
                a.getEndTime(),
                a.getStatus(),
                a.getType(),
                a.getReason(),
                a.getNotes());
    }

    private PatientResponse toPatientResponse(Patient p) {
        return new PatientResponse(
                p.getId(), p.getMrn(), p.getFirstName(), p.getLastName(), p.getDateOfBirth(),
                p.getGender(), p.getPhone(), p.getEmail(), p.getAddress(), p.getEmergencyContact(),
                p.getBloodType(),
                p.getAssignedDoctor() != null ? p.getAssignedDoctor().getId() : null,
                p.getAssignedDoctor() != null
                        ? p.getAssignedDoctor().getFirstName() + " " + p.getAssignedDoctor().getLastName()
                        : null,
                p.getActive());
    }

    private LabResultResponse toLabResultResponse(LabResult l) {
        return new LabResultResponse(
                l.getId(),
                l.getPatient().getId(),
                l.getTestName(),
                l.getTestCode(),
                l.getResult(),
                l.getUnit(),
                l.getReferenceRange(),
                l.getStatus(),
                l.getPerformedAt(),
                l.getOrderedBy() != null ? l.getOrderedBy().getId() : null,
                l.getOrderedBy() != null
                        ? l.getOrderedBy().getFirstName() + " " + l.getOrderedBy().getLastName()
                        : null,
                l.getNotes(),
                l.getImageUrl());
    }
}
