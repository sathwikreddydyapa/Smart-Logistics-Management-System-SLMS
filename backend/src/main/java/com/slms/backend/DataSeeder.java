package com.slms.backend;

import com.slms.backend.entity.User;
import com.slms.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding custom requested user...");

            // Admin 1: Sathwik Reddy Dyapa
            User admin1 = new User();
            admin1.setName("Sathwik Reddy Dyapa");
            admin1.setEmail("sathwikreddydyapa5506@gmail.com");
            admin1.setPassword(passwordEncoder.encode("dyapa5506"));
            admin1.setRole("admin");
            admin1.setPhoneNumber("+91 99999 88888");
            admin1.setAddress("Hyderabad, Telangana, India");
            admin1.setBio("Chief Operations Officer & Lead Developer of SLMS.");
            userRepository.save(admin1);

            // Admin 2: Siddhartha Goud Pasham
            User admin2 = new User();
            admin2.setName("Siddhartha Goud Pasham");
            admin2.setEmail("siddharthagoudpasham785@gmail.com");
            admin2.setPassword(passwordEncoder.encode("Si1711@2007"));
            admin2.setRole("admin");
            admin2.setPhoneNumber("+91 88888 99999");
            admin2.setAddress("Hyderabad, Telangana, India");
            userRepository.save(admin2);

            // Demo Driver
            User driver = new User();
            driver.setName("Rahul Sharma");
            driver.setEmail("driver@slms.com");
            driver.setPassword(passwordEncoder.encode("password"));
            driver.setRole("driver");
            driver.setPhoneNumber("+91 88888 77777");
            driver.setAddress("Mumbai, Maharashtra");
            driver.setEarnings(1250.50);
            userRepository.save(driver);

            // Demo Customer
            User customer = new User();
            customer.setName("Ananya Iyer");
            customer.setEmail("customer@slms.com");
            customer.setPassword(passwordEncoder.encode("password"));
            customer.setRole("customer");
            customer.setPhoneNumber("+91 77777 66666");
            customer.setAddress("Bangalore, Karnataka");
            userRepository.save(customer);

            System.out.println("Custom admins and demo users seeded successfully.");
        }
    }
}
