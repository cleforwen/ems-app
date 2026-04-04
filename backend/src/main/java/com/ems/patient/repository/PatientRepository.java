package com.ems.patient.repository;

import com.ems.patient.Patient;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PatientRepository implements PanacheRepository<Patient> {

    @Inject
    Logger log;

    public Optional<Patient> findByMrnAndHospital(String mrn, Long hospitalId) {
        log.debugf("Finding patient by MRN %s in hospital %d", mrn, hospitalId);
        return find("mrn = ?1 and hospital.id = ?2", mrn, hospitalId).firstResultOptional();
    }

    public List<Patient> findByHospitalIdPaginated(Long hospitalId, int page, int size) {
        log.debug("Finding patients for hospital " + hospitalId + " (page " + page + ", size " + size + ")");
        return find("hospital.id", Sort.by("lastName").and("firstName"), hospitalId)
                .page(Page.of(page, size))
                .list();
    }

    public long countByHospitalId(Long hospitalId) {
        return count("hospital.id", hospitalId);
    }

    public List<Patient> searchByHospitalId(Long hospitalId, String searchTerm, int page, int size) {
        log.debugf("Searching patients in hospital %d with term '%s' (page %d, size %d)", hospitalId, searchTerm, page, size);
        String term = "%" + searchTerm.toLowerCase() + "%";
        return find(
                "hospital.id = ?1 and (lower(firstName) like ?2 or lower(lastName) like ?2 or lower(mrn) like ?2 or phone like ?2)",
                Sort.by("lastName").and("firstName"), hospitalId, term)
                .page(Page.of(page, size))
                .list();
    }

    public long countSearchByHospitalId(Long hospitalId, String searchTerm) {
        String term = "%" + searchTerm.toLowerCase() + "%";
        return count(
                "hospital.id = ?1 and (lower(firstName) like ?2 or lower(lastName) like ?2 or lower(mrn) like ?2 or phone like ?2)",
                hospitalId, term);
    }
}
