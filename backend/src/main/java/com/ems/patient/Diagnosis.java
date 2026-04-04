package com.ems.patient;

import com.ems.common.entity.BaseEntity;
import com.ems.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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

    @Column(name = "diagnosed_at", nullable = false)
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

}
