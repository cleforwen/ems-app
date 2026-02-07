package com.ems.patient.repository;

import com.ems.patient.Patient;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class PatientRepository implements PanacheRepository<Patient> {

    public Optional<Patient> findByMrnAndHospital(String mrn, Long hospitalId) {
        return find("mrn = ?1 and hospital.id = ?2", mrn, hospitalId).firstResultOptional();
    }
}
