package com.ems.appointment;

import com.ems.appointment.dto.AppointmentResponse;
import com.ems.appointment.dto.CreateAppointmentRequest;
import com.ems.appointment.dto.UpdateAppointmentRequest;
import com.ems.hospital.Hospital;
import com.ems.hospital.HospitalRepository;
import com.ems.patient.Patient;
import com.ems.patient.repository.PatientRepository;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AppointmentService {

    @Inject
    AppointmentRepository appointmentRepository;
    @Inject
    PatientRepository patientRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    HospitalRepository hospitalRepository;
    @Inject
    JsonWebToken jwt;

    public List<AppointmentResponse> list(Long doctorId, LocalDate from, LocalDate to, String status) {
        Long hospitalId = getHospitalId();

        List<Appointment> appointments;

        if (doctorId != null && from != null && to != null) {
            appointments = appointmentRepository.findByDateRangeAndHospitalId(from, to, hospitalId)
                    .stream().filter(a -> a.getDoctor().getId().equals(doctorId))
                    .collect(Collectors.toList());
        } else if (from != null && to != null) {
            appointments = appointmentRepository.findByDateRangeAndHospitalId(from, to, hospitalId);
        } else if (doctorId != null) {
            appointments = appointmentRepository.findByDoctorIdAndHospitalId(doctorId, hospitalId);
        } else {
            appointments = appointmentRepository.findByHospitalId(hospitalId);
        }

        if (status != null && !status.isEmpty()) {
            Appointment.Status filterStatus = Appointment.Status.valueOf(status);
            appointments = appointments.stream()
                    .filter(a -> a.getStatus() == filterStatus)
                    .collect(Collectors.toList());
        }

        return appointments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse findById(Long id) {
        Appointment appointment = findAppointmentScoped(id);
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse create(CreateAppointmentRequest request) {
        Long hospitalId = getHospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId);

        Patient patient = patientRepository.findById(request.patientId());
        if (patient == null || !patient.getHospital().getId().equals(hospitalId)) {
            throw new WebApplicationException("Patient not found", Response.Status.NOT_FOUND);
        }

        User doctor = userRepository.findById(request.doctorId());
        if (doctor == null || !doctor.getHospital().getId().equals(hospitalId)) {
            throw new WebApplicationException("Doctor not found", Response.Status.NOT_FOUND);
        }

        // Check for overlapping appointments for the same doctor
        List<Appointment> existingAppts = appointmentRepository
                .findByDoctorIdAndDateAndHospitalId(doctor.getId(), request.appointmentDate(), hospitalId);
        for (Appointment existing : existingAppts) {
            if (existing.getStatus() == Appointment.Status.CANCELLED)
                continue;
            if (request.startTime().isBefore(existing.getEndTime()) &&
                    request.endTime().isAfter(existing.getStartTime())) {
                throw new WebApplicationException(
                        "Doctor has a conflicting appointment at this time",
                        Response.Status.CONFLICT);
            }
        }

        Appointment appointment = new Appointment();
        appointment.setHospital(hospital);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setType(request.type() != null ? request.type() : Appointment.Type.CONSULTATION);
        appointment.setReason(request.reason());
        appointment.setNotes(request.notes());

        appointment.setCreatedBy(jwt.getName());
        appointmentRepository.persist(appointment);
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse update(Long id, UpdateAppointmentRequest request) {
        Appointment appointment = findAppointmentScoped(id);
        Long hospitalId = getHospitalId();

        if (request.patientId() != null) {
            Patient patient = patientRepository.findById(request.patientId());
            if (patient != null && patient.getHospital().getId().equals(hospitalId)) {
                appointment.setPatient(patient);
            }
        }
        if (request.doctorId() != null) {
            User doctor = userRepository.findById(request.doctorId());
            if (doctor != null && doctor.getHospital().getId().equals(hospitalId)) {
                appointment.setDoctor(doctor);
            }
        }
        if (request.appointmentDate() != null)
            appointment.setAppointmentDate(request.appointmentDate());
        if (request.startTime() != null)
            appointment.setStartTime(request.startTime());
        if (request.endTime() != null)
            appointment.setEndTime(request.endTime());
        if (request.status() != null)
            appointment.setStatus(request.status());
        if (request.type() != null)
            appointment.setType(request.type());
        if (request.reason() != null)
            appointment.setReason(request.reason());
        if (request.notes() != null)
            appointment.setNotes(request.notes());

        appointment.setModifiedBy(jwt.getName());
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, Appointment.Status status) {
        Appointment appointment = findAppointmentScoped(id);
        appointment.setStatus(status);
        appointment.setModifiedBy(jwt.getName());
        return toResponse(appointment);
    }

    @Transactional
    public void delete(Long id) {
        Appointment appointment = findAppointmentScoped(id);
        appointment.setStatus(Appointment.Status.CANCELLED);
        appointment.setModifiedBy(jwt.getName());
    }

    private Appointment findAppointmentScoped(Long id) {
        Appointment appointment = appointmentRepository.findById(id);
        if (appointment == null) {
            throw new WebApplicationException("Appointment not found", Response.Status.NOT_FOUND);
        }
        if (!appointment.getHospital().getId().equals(getHospitalId())) {
            throw new WebApplicationException("Access denied", Response.Status.FORBIDDEN);
        }
        return appointment;
    }

    private Long getHospitalId() {
        Object claim = jwt.getClaim("hospitalId");
        if (claim == null) {
            throw new WebApplicationException("Invalid token: missing hospitalId", Response.Status.UNAUTHORIZED);
        }
        return Long.parseLong(claim.toString());
    }

    private AppointmentResponse toResponse(Appointment a) {
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
}
