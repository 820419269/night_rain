package com.badminton.repository;

import com.badminton.model.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByVideoIdOrderByCreatedAtDesc(Long videoId);
    
    @Query("SELECT AVG(a.overallScore) FROM Analysis a")
    Double findAverageOverallScore();
    
    @Query("SELECT COUNT(DISTINCT a.video.id) FROM Analysis a")
    Long countDistinctVideos();
}
