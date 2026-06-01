package com.badminton.controller;

import com.badminton.model.Action;
import com.badminton.model.Analysis;
import com.badminton.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalysisController {
    
    private final AnalysisService analysisService;
    
    @PostMapping
    public ResponseEntity<Analysis> createAnalysis(@RequestBody Map<String, Object> request) {
        Long videoId = Long.valueOf(request.get("videoId").toString());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> actionsData = (List<Map<String, Object>>) request.get("actions");
        BigDecimal overallScore = new BigDecimal(request.get("overallScore").toString());
        String summary = (String) request.get("summary");
        
        List<Action> actions = actionsData.stream()
                .map(data -> {
                    Action action = new Action();
                    action.setType((String) data.get("type"));
                    action.setFrame(((Number) data.get("frame")).intValue());
                    action.setScore(new BigDecimal(data.get("score").toString()));
                    action.setStatus((String) data.get("status"));
                    action.setNotes((String) data.get("notes"));
                    return action;
                })
                .toList();
        
        Analysis analysis = analysisService.createAnalysis(videoId, actions, overallScore, summary);
        return ResponseEntity.ok(analysis);
    }
    
    @GetMapping
    public ResponseEntity<List<Analysis>> getAllAnalyses() {
        return ResponseEntity.ok(analysisService.getAllAnalyses());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Analysis> getAnalysisById(@PathVariable Long id) {
        try {
            Analysis analysis = analysisService.getAnalysisById(id);
            return ResponseEntity.ok(analysis);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Analysis> updateAnalysis(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> actionsData = (List<Map<String, Object>>) request.get("actions");
        BigDecimal overallScore = new BigDecimal(request.get("overallScore").toString());
        String summary = (String) request.get("summary");
        
        List<Action> actions = actionsData.stream()
                .map(data -> {
                    Action action = new Action();
                    action.setType((String) data.get("type"));
                    action.setFrame(((Number) data.get("frame")).intValue());
                    action.setScore(new BigDecimal(data.get("score").toString()));
                    action.setStatus((String) data.get("status"));
                    action.setNotes((String) data.get("notes"));
                    return action;
                })
                .toList();
        
        Analysis analysis = analysisService.updateAnalysis(id, actions, overallScore, summary);
        return ResponseEntity.ok(analysis);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(analysisService.getStatistics());
    }
}
