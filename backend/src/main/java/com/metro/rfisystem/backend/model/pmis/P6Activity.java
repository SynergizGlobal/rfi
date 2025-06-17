package com.metro.rfisystem.backend.model.pmis;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "p6_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class P6Activity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "p6_activity_id")
	private Integer id;

	@Column(name = "task_code", length = 50)
	private String taskCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contract_id_fk")
	private Contract contract;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "structure_id_fk")
	private Structure structure;

	@Column(name = "p6_activity_name", length = 100)
	private String activityName;

	@Column(name = "from_structure_id", length = 50)
	private String fromStructureId;

	@Column(name = "to_structure_id", length = 50)
	private String toStructureId;

	@Column(name = "section", length = 100)
	private String section;

	@Column(name = "line", length = 100)
	private String line;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "p6_wbs_code_fk")
//    private P6WBSCode wbsCode;

	@Column(name = "component", length = 100)
	private String component;

	@Column(name = "component_id", length = 100)
	private String componentId;

	@Column(name = "order_x")
	private Integer orderX;

	@Column(name = "order_y")
	private Integer orderY;

	@Column(name = "baseline_start")
	private LocalDate baselineStart;

	@Column(name = "baseline_finish")
	private LocalDate baselineFinish;

	@Column(name = "start")
	private LocalDate start;

	@Column(name = "finish")
	private LocalDate finish;

	@Column(name = "float")
	private Integer floatDays;

	@Column(name = "original_duration")
	private Integer originalDuration;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "status_fk")
//    private Status status;

	@Column(name = "unit", length = 20)
	private String unit;

	@Column(name = "scope")
	private Double scope;

	@Column(name = "completed")
	private Double completed;

	@Column(name = "weightage")
	private Double weightage;

	@Column(name = "component_details", length = 100)
	private String componentDetails;

	@Column(name = "remarks", length = 1000)
	private String remarks;
}