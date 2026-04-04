package com.ems.patient.repository;

import com.ems.patient.PatientNote;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class PatientNoteRepository implements PanacheRepository<PatientNote> {

    public List<PatientNote> findByPatientId(Long patientId) {
        return find("patient.id", Sort.by("noteCreatedAt").descending(), patientId).list();
    }
}
