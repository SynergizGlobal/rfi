package com.metro.rfisystem.backend.model.pmis;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "contract")
@Data
public class Contract {
 
    @Id
    @Column(name = "contract_id", length = 20)
    private String contractId;
 
    @Column(name = "work_id_fk", length = 15)
    private String workIdFk;
 
    @Column(name = "contract_name", length = 3000)
    private String contractName;
 
    @Column(name = "contract_short_name", length = 100)
    private String contractShortName;
 
    @Column(name = "contract_type_fk", length = 45)
    private String contractTypeFk;
 
    @Column(name = "scope_of_contract", length = 1000)
    private String scopeOfContract;
 
    @Column(name = "contractor_id_fk", length = 20)
    private String contractorIdFk;
 
    @Column(name = "department_fk", length = 45)
    private String departmentFk;
 
    @Column(name = "hod_user_id_fk", length = 20)
    private String hodUserIdFk;
 
    @Column(name = "dy_hod_user_id_fk", length = 20)
    private String dyHodUserIdFk;
 
    @Column(name = "tally_head", length = 100)
    private String tallyHead;
 
    @Column(name = "estimated_cost")
    private Double estimatedCost;
 
    @Column(name = "estimated_cost_units")
    private Long estimatedCostUnits;
 
    @Column(name = "awarded_cost")
    private Double awardedCost;
 
    @Column(name = "awarded_cost_units")
    private Long awardedCostUnits;
 
    @Column(name = "loa_letter_number", length = 100)
    private String loaLetterNumber;
 
    @Column(name = "loa_date")
    @Temporal(TemporalType.DATE)
    private Date loaDate;
 
    @Column(name = "ca_no", length = 100)
    private String caNo;
 
    @Column(name = "ca_date")
    @Temporal(TemporalType.DATE)
    private Date caDate;
 
    @Column(name = "date_of_start")
    @Temporal(TemporalType.DATE)
    private Date dateOfStart;
 
    @Column(name = "doc")
    @Temporal(TemporalType.DATE)
    private Date doc;
 
    @Column(name = "target_doc")
    @Temporal(TemporalType.DATE)
    private Date targetDoc;
 
    @Column(name = "actual_completion_date")
    @Temporal(TemporalType.DATE)
    private Date actualCompletionDate;
 
    @Column(name = "completed_cost")
    private Double completedCost;
 
    @Column(name = "completed_cost_units")
    private Long completedCostUnits;
 
    @Column(name = "contract_closure_date")
    @Temporal(TemporalType.DATE)
    private Date contractClosureDate;
 
    @Column(name = "remarks", length = 1000)
    private String remarks;
 
    @Column(name = "completion_certificate_release")
    @Temporal(TemporalType.DATE)
    private Date completionCertificateRelease;
 
    @Column(name = "final_takeover")
    @Temporal(TemporalType.DATE)
    private Date finalTakeover;
 
    @Column(name = "final_bill_release")
    @Temporal(TemporalType.DATE)
    private Date finalBillRelease;
 
    @Column(name = "contract_status_fk", length = 20)
    private String contractStatusFk;
 
    @Column(name = "defect_liability_period")
    @Temporal(TemporalType.DATE)
    private Date defectLiabilityPeriod;
 
    @Column(name = "retention_money_release")
    @Temporal(TemporalType.DATE)
    private Date retentionMoneyRelease;
 
    @Column(name = "pbg_release")
    @Temporal(TemporalType.DATE)
    private Date pbgRelease;
 
    @Column(name = "contract_closure", length = 20)
    private String contractClosure;
 
    @Column(name = "is_contract_closure_initiated", length = 20)
    private String isContractClosureInitiated;
 
    @Column(name = "bg_required", length = 3)
    private String bgRequired;
 
    @Column(name = "insurance_required", length = 3)
    private String insuranceRequired;
 
    @Column(name = "milestone_requried", length = 3)
    private String milestoneRequired;
 
    @Column(name = "revision_requried", length = 3)
    private String revisionRequired;
 
    @Column(name = "contractors_key_requried", length = 3)
    private String contractorsKeyRequired;
 
    @Column(name = "status", length = 45)
    private String status;
 
    @Column(name = "actual_date_of_commissioning")
    @Temporal(TemporalType.DATE)
    private Date actualDateOfCommissioning;
 
    @Column(name = "planned_date_of_award")
    @Temporal(TemporalType.DATE)
    private Date plannedDateOfAward;
 
    @Column(name = "planned_date_of_completion")
    @Temporal(TemporalType.DATE)
    private Date plannedDateOfCompletion;
 
    @Column(name = "created_by", length = 45)
    private String createdBy;
 
    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;
 
    @Column(name = "modified_by", length = 45)
    private String modifiedBy;
 
    @Column(name = "modified_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date modifiedDate;
}