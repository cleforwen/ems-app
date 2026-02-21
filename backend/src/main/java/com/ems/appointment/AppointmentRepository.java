package com.ems.appointment;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class AppointmentRepository implements PanacheRepository<Appointment> {

    public List<Appointment> findByHospitalId(Long hospitalId) {
        return list("hospital.id", hospitalId);
    }

    public List<Appointment> findByDoctorIdAndHospitalId(Long doctorId, Long hospitalId) {
        return list("doctor.id = ?1 and hospital.id = ?2", doctorId, hospitalId);
    }

    public List<Appointment> findByDateRangeAndHospitalId(LocalDate from, LocalDate to, Long hospitalId) {
        return list("appointmentDate >= ?1 and appointmentDate <= ?2 and hospital.id = ?3", from, to, hospitalId);
    }

    public List<Appointment> findByPatientId(Long patientId) {
        return list("patient.id", patientId);
    }

    public List<Appointment> findByDateAndHospitalId(LocalDate date, Long hospitalId) {
        return list("appointmentDate = ?1 and hospital.id = ?2", date, hospitalId);
    }

    public List<Appointment> findByDoctorIdAndDateAndHospitalId(Long doctorId, LocalDate date, Long hospitalId) {
        return list("doctor.id = ?1 and appointmentDate = ?2 and hospital.id = ?3", doctorId, date, hospitalId);
    }

    public long countByDateAndHospitalId(LocalDate date, Long hospitalId) {
        return count("appointmentDate = ?1 and hospital.id = ?2", date, hospitalId);
    }

    public long countByDateAndStatusNotAndHospitalId(LocalDate date, Long hospitalId) {
        return count(
                "appointmentDate = ?1 and hospital.id = ?2 and status not in ('COMPLETED', 'CANCELLED', 'NO_SHOW')",
                date, hospitalId);
    }

    public List<Appointment> findUpcomingByDoctorId(Long doctorId, LocalDate fromDate, Long hospitalId, int limit) {
        return find(
                "doctor.id = ?1 and appointmentDate >= ?2 and hospital.id = ?3 and status != 'CANCELLED' order by appointmentDate asc, startTime asc",
                doctorId, fromDate, hospitalId)
                .page(0, limit)
                .list();
    }

    public List<Appointment> findUpcomingByHospitalId(LocalDate fromDate, Long hospitalId, int limit) {
        return find(
                "appointmentDate >= ?1 and hospital.id = ?2 and status != 'CANCELLED' order by appointmentDate asc, startTime asc",
                fromDate, hospitalId)
                .page(0, limit)
                .list();
    }
}
