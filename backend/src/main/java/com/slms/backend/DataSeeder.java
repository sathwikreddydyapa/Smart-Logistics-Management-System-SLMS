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

            // Custom user requested by Sathwik
            // Master user: Sathwik
            User master = new User();
            master.setName("Sathwik Reddy Dyapa");
            master.setEmail("sathwikreddydyapa5506@gmail.com");
            master.setPassword(passwordEncoder.encode("dyapa5506"));
            master.setRole("admin");
            master.setPhoneNumber("+91 99999 88888");
            master.setAddress("Hyderabad, Telangana, India");
            master.setBio("Chief Operations Officer & Lead Developer of SLMS.");
            userRepository.save(master);

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

            System.out.println("Custom user seeded successfully.");
        }
    }
}
