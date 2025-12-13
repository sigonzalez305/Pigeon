package com.pigeon.messenger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PigeonMessengerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PigeonMessengerApplication.class, args);
    }
}
