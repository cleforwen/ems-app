package com.ems.patient;

import com.ems.common.entity.BaseEntity;
import com.ems.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "diagnoses")
public class Diagnosis extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "icd_code")
    private String icdCode;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate diagnosedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnosed_by")
    private User diagnosedBy;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum Status {
        ACTIVE, RESOLVED, CHRONIC
    }

    // Getters and Setters
    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getIcdCode() {
        return icdCode;
    }

    public void setIcdCode(String icdCode) {
        this.icdCode = icdCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDiagnosedAt() {
        return diagnosedAt;
    }

    public void setDiagnosedAt(LocalDate diagnosedAt) {
        this.diagnosedAt = diagnosedAt;
    }

    public User getDiagnosedBy() {
        return diagnosedBy;
    }

    public void setDiagnosedBy(User diagnosedBy) {
        this.diagnosedBy = diagnosedBy;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
