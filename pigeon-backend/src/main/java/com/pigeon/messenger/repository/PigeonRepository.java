package com.pigeon.messenger.repository;

import com.pigeon.messenger.entity.Pigeon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PigeonRepository extends JpaRepository<Pigeon, Long> {
    List<Pigeon> findByUserIdAndIsInPartyTrue(Long userId);
    List<Pigeon> findByUserId(Long userId);
}
