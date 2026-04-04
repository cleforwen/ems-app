package com.ems.appointment;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class AppointmentRepository implements PanacheRepository<Appointment> {

    @Inject
    Logger log;

    public List<Appointment> findByHospitalId(Long hospitalId) {
        log.debugf("Finding appointments by hospital %d", hospitalId);
        return list("hospital.id", hospitalId);
    }

    public List<Appointment> findByHospitalIdPaginated(Long hospitalId, int page, int size) {
        log.debug("Finding appointments for hospital " + hospitalId + " (page " + page + ", size " + size + ")");
        return find("hospital.id", Sort.by("appointmentDate").and("startTime"), hospitalId)
                .page(Page.of(page, size))
                .list();
    }

    public long countByHospitalId(Long hospitalId) {
        return count("hospital.id", hospitalId);
    }

    public List<Appointment> findByDoctorIdAndHospitalId(Long doctorId, Long hospitalId) {
        log.debugf("Finding appointments for doctor %d in hospital %d", doctorId, hospitalId);
        return list("doctor.id = ?1 and hospital.id = ?2", doctorId, hospitalId);
    }

    public List<Appointment> findByDoctorIdAndHospitalIdPaginated(Long doctorId, Long hospitalId, int page, int size) {
        log.debug("Finding appointments for doctor " + doctorId + " in hospital " + hospitalId);
        return find("doctor.id = ?1 and hospital.id = ?2", Sort.by("appointmentDate").and("startTime"), doctorId, hospitalId)
                .page(Page.of(page, size))
                .list();
    }

    public List<Appointment> findByDateRangeAndHospitalId(LocalDate from, LocalDate to, Long hospitalId) {
        log.debugf("Finding appointments from %s to %s in hospital %d", from, to, hospitalId);
        return list("appointmentDate >= ?1 and appointmentDate <= ?2 and hospital.id = ?3", from, to, hospitalId);
    }

    public List<Appointment> findByDateRangeAndHospitalIdPaginated(LocalDate from, LocalDate to, Long hospitalId, int page, int size) {
        log.debug("Finding appointments from " + from + " to " + to + " in hospital " + hospitalId);
        return find("appointmentDate >= ?1 and appointmentDate <= ?2 and hospital.id = ?3",
                Sort.by("appointmentDate").and("startTime"), from, to, hospitalId)
                .page(Page.of(page, size))
                .list();
    }

    public List<Appointment> findByPatientId(Long patientId) {
        log.debugf("Finding appointments for patient %d", patientId);
        return list("patient.id", patientId);
    }

    public List<Appointment> findByDateAndHospitalId(LocalDate date, Long hospitalId) {
        log.debugf("Finding appointments on %s in hospital %d", date, hospitalId);
        return list("appointmentDate = ?1 and hospital.id = ?2", date, hospitalId);
    }

    public List<Appointment> findByDoctorIdAndDateAndHospitalId(Long doctorId, LocalDate date, Long hospitalId) {
        log.debugf("Finding appointments for doctor %d on %s in hospital %d", doctorId, date, hospitalId);
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
