package com.badminton.repository;

import com.badminton.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long> {
    List<Action> findByAnalysisId(Long analysisId);
    
    @Query("SELECT a.type, COUNT(a), " +
           "SUM(CASE WHEN a.status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(a) " +
           "FROM Action a GROUP BY a.type")
    List<Object[]> findActionStatisticsByType();
}
