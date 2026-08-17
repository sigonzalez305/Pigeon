package com.pigeon.messenger.repository;

import com.pigeon.messenger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);

    /**
     * Looks a user up by the last 10 digits of their phone number, so a recipient
     * typed as "(305) 555-0178" matches a stored "+13055550178". Exact-string
     * findByPhone cannot do this and silently misses every formatted input.
     */
    @Query(value = "SELECT * FROM users WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = :nationalDigits",
           nativeQuery = true)
    Optional<User> findByNationalPhoneDigits(@Param("nationalDigits") String nationalDigits);
}
