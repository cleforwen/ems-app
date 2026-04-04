package com.ems.patient;

import com.ems.common.entity.BaseEntity;
import com.ems.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "lab_results")
public class LabResult extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(name = "test_code")
    private String testCode;

    @Column(nullable = false)
    private String result;

    private String unit;

    @Column(name = "reference_range")
    private String referenceRange;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordered_by")
    private User orderedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "image_url")
    private String imageUrl;

    public enum Status {
        NORMAL, ABNORMAL, CRITICAL
    }

}
