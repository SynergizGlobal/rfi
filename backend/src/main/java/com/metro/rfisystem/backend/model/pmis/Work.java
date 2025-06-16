package com.metro.rfisystem.backend.model.pmis;
 
import jakarta.persistence.*;


import lombok.Data;
 
import java.math.BigDecimal;

import java.time.LocalDate;
 
@Entity

@Table(name = "work")

@Data

public class Work {
 
	@Id
    @Column(name = "work_id", length = 15, nullable = false)
    private String workId;
 
    @Column(name = "work_name", length = 1000)
    private String workName;
 
    @Column(name = "work_short_name", length = 100)
    private String workShortName;
 
    @Column(name = "work_code", length = 2)
    private String workCode;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id_fk", referencedColumnName = "project_id")
    private Project project;
 
    @Column(name = "sanctioned_year_fk", length = 20)
    private String sanctionedYearFk;
 
    @Column(name = "sanctioned_estimated_cost")
    private Double sanctionedEstimatedCost;
 
    @Column(name = "sanctioned_estimated_cost_unit", length = 20)
    private String sanctionedEstimatedCostUnit;
 
    @Column(name = "completeion_period_months")  // Keeping DB column name as-is, but fixing Java field name
    private Double completionPeriodMonths;
 
    @Column(name = "sanctioned_completion_cost")
    private Double sanctionedCompletionCost;
 
    @Column(name = "sanctioned_completion_cost_unit", length = 20)
    private String sanctionedCompletionCostUnit;
 
    @Column(name = "anticipated_cost")
    private Double anticipatedCost;
 
    @Column(name = "anticipated_cost_unit", length = 20)
    private String anticipatedCostUnit;
 
    @Column(name = "year_of_completion", length = 20)
    private String yearOfCompletion;
 
    @Column(name = "projected_completion")
    private LocalDate projectedCompletion;
 
    @Column(name = "completion_cost")
    private Double completionCost;
 
    @Column(name = "completion_cost_unit", length = 20)
    private String completionCostUnit;
 
    @Column(name = "attachment", length = 1000)
    private String attachment;
 
    @Column(name = "remarks", length = 1000)
    private String remarks;
 
    @Column(name = "pink_book_item_number", length = 30)
    private String pinkBookItemNumber;
 
    @Column(name = "projected_completion_date")
    private LocalDate projectedCompletionDate;
 
    @Column(name = "work_status_fk", length = 20)
    private String workStatusFk;
 
    @Column(name = "work_type_fk", length = 20)
    private String workTypeFk;
}
 