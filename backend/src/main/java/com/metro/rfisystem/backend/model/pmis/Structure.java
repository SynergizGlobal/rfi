package com.metro.rfisystem.backend.model.pmis;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
 
@Entity
@Table(name = "structure")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Structure {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "structure_id")
    private Integer structureId;
 
    @Column(name = "structure_name", length = 45)
    private String structureName;
 
    @Column(name = "work_id_fk", length = 15)
    private String workIdFk;
 
    @Column(name = "contract_id_fk", length = 20)
    private String contractIdFk;
 
    @Column(name = "department_fk", length = 45)
    private String departmentFk;
 
    @Column(name = "structure_type_fk", length = 45)
    private String structureTypeFk;
 
    @Column(name = "structure", length = 45)
    private String structure;
 
    @Column(name = "work_status_fk", length = 20)
    private String workStatusFk;
 
    @Column(name = "target_date")
    private LocalDate targetDate;
 
    @Column(name = "estimated_cost")
    private Double estimatedCost;
 
    @Column(name = "estimated_cost_units", length = 20)
    private String estimatedCostUnits;
 
    @Column(name = "completion_cost")
    private Double completionCost;
 
    @Column(name = "completion_cost_units", length = 20)
    private String completionCostUnits;
 
    @Column(name = "construction_start_date")
    private LocalDate constructionStartDate;
 
    @Column(name = "revised_completion")
    private LocalDate revisedCompletion;
 
    @Column(name = "commissioning_date")
    private LocalDate commissioningDate;
 
    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;
 
    @Column(name = "latitude")
    private Double latitude;
 
    @Column(name = "longitude")
    private Double longitude;
 
    @Column(name = "remarks", length = 200)
    private String remarks;
 
    @Column(name = "status", length = 10)
    private String status;
}