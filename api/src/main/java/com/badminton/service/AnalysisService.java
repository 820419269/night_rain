package com.badminton.service;

import com.badminton.model.Action;
import com.badminton.model.Analysis;
import com.badminton.model.Video;
import com.badminton.repository.ActionRepository;
import com.badminton.repository.AnalysisRepository;
import com.badminton.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisService {
    
    private final AnalysisRepository analysisRepository;
    private final ActionRepository actionRepository;
    private final VideoRepository videoRepository;
    
    @Transactional
    public Analysis createAnalysis(Long videoId, List<Action> actionsData, 
                                   BigDecimal overallScore, String summary) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        Analysis analysis = new Analysis();
        analysis.setVideo(video);
        analysis.setOverallScore(overallScore);
        analysis.setSummary(summary);
        
        BigDecimal successCount = BigDecimal.ZERO;
        for (Action actionData : actionsData) {
            Action action = new Action();
            action.setAnalysis(analysis);
            action.setType(actionData.getType());
            action.setFrame(actionData.getFrame());
            action.setScore(actionData.getScore());
            action.setStatus(actionData.getStatus());
            action.setNotes(actionData.getNotes());
            analysis.getActions().add(action);
            
            if ("success".equals(actionData.getStatus())) {
                successCount = successCount.add(BigDecimal.ONE);
            }
        }
        
        if (!actionsData.isEmpty()) {
            BigDecimal successRate = successCount
                    .divide(BigDecimal.valueOf(actionsData.size()), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            analysis.setSuccessRate(successRate);
        }
        
        return analysisRepository.save(analysis);
    }
    
    public List<Analysis> getAllAnalyses() {
        return analysisRepository.findAll();
    }
    
    public Analysis getAnalysisById(Long id) {
        return analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found with id: " + id));
    }
    
    @Transactional
    public Analysis updateAnalysis(Long id, List<Action> actionsData, 
                                   BigDecimal overallScore, String summary) {
        Analysis analysis = getAnalysisById(id);
        
        analysis.getActions().clear();
        
        BigDecimal successCount = BigDecimal.ZERO;
        for (Action actionData : actionsData) {
            Action action = new Action();
            action.setAnalysis(analysis);
            action.setType(actionData.getType());
            action.setFrame(actionData.getFrame());
            action.setScore(actionData.getScore());
            action.setStatus(actionData.getStatus());
            action.setNotes(actionData.getNotes());
            analysis.getActions().add(action);
            
            if ("success".equals(actionData.getStatus())) {
                successCount = successCount.add(BigDecimal.ONE);
            }
        }
        
        analysis.setOverallScore(overallScore);
        analysis.setSummary(summary);
        
        if (!actionsData.isEmpty()) {
            BigDecimal successRate = successCount
                    .divide(BigDecimal.valueOf(actionsData.size()), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            analysis.setSuccessRate(successRate);
        }
        
        return analysisRepository.save(analysis);
    }
    
    public Map<String, Object> getStatistics() {
        Long totalVideos = analysisRepository.countDistinctVideos();
        Double averageScore = analysisRepository.findAverageOverallScore();
        List<Object[]> actionStats = actionRepository.findActionStatisticsByType();
        
        return Map.of(
            "totalVideos", totalVideos != null ? totalVideos : 0,
            "totalAnalyses", analysisRepository.count(),
            "averageScore", averageScore != null ? averageScore : 0.0,
            "actionStats", actionStats.stream()
                .map(stat -> Map.of(
                    "type", stat[0],
                    "count", ((Number) stat[1]).intValue(),
                    "successRate", stat[2] != null ? ((Number) stat[2]).doubleValue() : 0.0
                ))
                .collect(Collectors.toList())
        );
    }
}
