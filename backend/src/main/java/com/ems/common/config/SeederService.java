package com.ems.common.config;

import com.ems.hospital.Hospital;
import com.ems.hospital.HospitalRepository;
import com.ems.user.Role;
import com.ems.user.User;
import com.ems.user.repository.UserRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Set;

@ApplicationScoped
public class SeederService {

    @Inject
    Logger log;

    @Inject
    HospitalRepository hospitalRepository;

    @Inject
    UserRepository userRepository;

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        if (hospitalRepository.count() == 0) {
            log.info("Seeding initial data...");

            Hospital hospital = new Hospital();
            hospital.setName("General Hospital");
            hospital.setCode("GH001");
            hospital.setAddress("123 Main St");
            hospital.setActive(true);
            hospital.setCreatedBy("system");
            hospitalRepository.persist(hospital);

            User admin = new User();
            admin.setHospital(hospital);
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail("admin@ems.com");

            admin.setRoles(Set.of(Role.ADMIN));
            admin.setActive(true);
            admin.setCreatedBy("system");
            userRepository.persist(admin);

            log.info("Seeding completed. Admin user: admin@ems.com / password");
        }
    }
}
