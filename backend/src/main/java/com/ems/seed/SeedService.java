package com.ems.seed;

import com.ems.appointment.Appointment;
import com.ems.appointment.AppointmentRepository;
import com.ems.hospital.Hospital;
import com.ems.hospital.HospitalRepository;
import com.ems.patient.Patient;
import com.ems.patient.repository.PatientRepository;
import com.ems.user.Role;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import net.datafaker.Faker;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@ApplicationScoped
public class SeedService {

    @Inject
    HospitalRepository hospitalRepository;

    @Inject
    PatientRepository patientRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    AppointmentRepository appointmentRepository;

    @Inject
    JsonWebToken jwt;

    private static final Role[] STAFF_ROLES = {
            Role.DOCTOR, Role.NURSE, Role.STAFF
    };

    private static final String[] BLOOD_TYPES = {
            "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
    };

    private static final Patient.Gender[] GENDERS = Patient.Gender.values();

    private static final Appointment.Status[] STATUSES = {
            Appointment.Status.SCHEDULED,
            Appointment.Status.COMPLETED,
            Appointment.Status.CANCELLED,
            Appointment.Status.NO_SHOW,
            Appointment.Status.CHECKED_IN
    };

    private static final Appointment.Type[] TYPES = Appointment.Type.values();

    @Transactional
    public SeedResult generate() {
        Long hospitalId = getHospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId);
        if (hospital == null) {
            throw new WebApplicationException("Hospital not found", Response.Status.NOT_FOUND);
        }

        String actor = jwt.getName() != null ? jwt.getName() : "seed";
        Faker faker = new Faker(new Random());

        // ── 1. Generate 200 staff ────────────────────────────────────────────
        List<User> doctors = new ArrayList<>();
        int staffCount = 0;
        for (int i = 0; i < 200; i++) {
            String firstName = faker.name().firstName();
            String lastName = faker.name().lastName();
            String email = faker.internet().emailAddress(
                    (firstName + "." + lastName + i).toLowerCase().replaceAll("[^a-z0-9.]", ""));

            // Skip if email already exists
            if (!userRepository.listByEmail(email).isEmpty()) {
                continue;
            }

            User user = new User();
            user.setHospital(hospital);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setActive(true);
            user.setCreatedBy(actor);

            Role role = STAFF_ROLES[i % STAFF_ROLES.length];
            user.setRoles(Set.of(role));

            userRepository.persist(user);
            if (role == Role.DOCTOR) {
                doctors.add(user);
            }
            staffCount++;
        }

        // Flush to get IDs
        userRepository.flush();

        // If we have no doctors from our newly created staff, query existing ones
        if (doctors.isEmpty()) {
            doctors = userRepository.list("hospital.id = ?1", hospitalId)
                    .stream()
                    .filter(u -> u.getRoles().contains(Role.DOCTOR))
                    .toList();
        }
        if (doctors.isEmpty()) {
            throw new WebApplicationException(
                    Response.status(422).entity(Map.of("error", "No doctors available to assign appointments")).build());
        }

        // ── 2. Generate 5000 patients ────────────────────────────────────────
        Set<String> usedMrns = new HashSet<>();
        List<Patient> patients = new ArrayList<>();
        int patientCount = 0;
        Random rng = new Random();

        for (int i = 0; i < 5000; i++) {
            Patient patient = new Patient();
            patient.setHospital(hospital);
            patient.setFirstName(faker.name().firstName());
            patient.setLastName(faker.name().lastName());
            patient.setDateOfBirth(
                    LocalDate.now().minusYears(18 + rng.nextInt(70)).minusDays(rng.nextInt(365)));
            patient.setGender(GENDERS[rng.nextInt(GENDERS.length)]);
            patient.setPhone(faker.phoneNumber().phoneNumber());
            patient.setEmail(faker.internet().emailAddress());
            patient.setAddress(faker.address().fullAddress());
            patient.setBloodType(BLOOD_TYPES[rng.nextInt(BLOOD_TYPES.length)]);
            patient.setEmergencyContact(faker.name().fullName() + " - " + faker.phoneNumber().phoneNumber());
            patient.setActive(true);
            patient.setCreatedBy(actor);

            // Assign a random doctor
            patient.setAssignedDoctor(doctors.get(rng.nextInt(doctors.size())));

            // Generate unique MRN
            String mrn;
            do {
                mrn = "MRN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 24).toUpperCase();
            } while (usedMrns.contains(mrn));
            usedMrns.add(mrn);
            patient.setMrn(mrn);

            patientRepository.persist(patient);
            patients.add(patient);
            patientCount++;

            // Flush in batches to avoid memory issues
            if (i % 500 == 0) {
                patientRepository.flush();
            }
        }

        patientRepository.flush();

        // ── 3. Generate 1000 appointments ───────────────────────────────────
        int appointmentCount = 0;
        for (int i = 0; i < 1000; i++) {
            Patient patient = patients.get(rng.nextInt(patients.size()));
            User doctor = doctors.get(rng.nextInt(doctors.size()));

            // Random date within ±6 months
            int daysOffset = rng.nextInt(365) - 180;
            LocalDate date = LocalDate.now().plusDays(daysOffset);

            // Random start hour 8–17
            int startHour = 8 + rng.nextInt(10);
            LocalTime startTime = LocalTime.of(startHour, rng.nextBoolean() ? 0 : 30);
            LocalTime endTime = startTime.plusMinutes(30 + rng.nextInt(3) * 30L);

            Appointment appt = new Appointment();
            appt.setHospital(hospital);
            appt.setPatient(patient);
            appt.setDoctor(doctor);
            appt.setAppointmentDate(date);
            appt.setStartTime(startTime);
            appt.setEndTime(endTime);
            appt.setStatus(STATUSES[rng.nextInt(STATUSES.length)]);
            appt.setType(TYPES[rng.nextInt(TYPES.length)]);
            appt.setReason(faker.lorem().sentence(5));
            appt.setNotes(rng.nextBoolean() ? faker.lorem().sentence(10) : null);
            appt.setCreatedBy(actor);

            appointmentRepository.persist(appt);
            appointmentCount++;

            if (i % 200 == 0) {
                appointmentRepository.flush();
            }
        }

        return new SeedResult(staffCount, patientCount, appointmentCount);
    }

    private Long getHospitalId() {
        Object claim = jwt.getClaim("hospitalId");
        if (claim == null) {
            throw new WebApplicationException("Invalid token: missing hospitalId", Response.Status.UNAUTHORIZED);
        }
        return Long.parseLong(claim.toString());
    }

    public record SeedResult(int staffCreated, int patientsCreated, int appointmentsCreated) {}
}
