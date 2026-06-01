package com.badminton.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "action")
@Data
public class Action {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private Analysis analysis;
    
    @Column(nullable = false, length = 50)
    private String type;
    
    private Integer frame;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal score = BigDecimal.ZERO;
    
    @Column(nullable = false, length = 20)
    private String status;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
