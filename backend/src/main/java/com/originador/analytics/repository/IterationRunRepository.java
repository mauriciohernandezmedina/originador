package com.originador.analytics.repository;

import com.originador.analytics.model.IterationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IterationRunRepository extends JpaRepository<IterationRun, String> {

    List<IterationRun> findAllByOrderByCreatedAtDesc();
}
