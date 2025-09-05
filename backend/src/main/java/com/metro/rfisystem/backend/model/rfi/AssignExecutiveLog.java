package com.metro.rfisystem.backend.model.rfi;

import java.util.Date;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assign_executive_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignExecutiveLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;
	
	@Column(name = "contract_short_name")
	private String contract;
	
    @Column(name="contract_id")
    private String contractId;

	@Column(name = "structure_type")
	private String structureType;
	
	private String structure;
	
	@Column(name = "assigned_person_client")
	private String assignedPersonClient;
	
	@Column(name = "assigned_person_department")
	private String assignedPersonDepartment;
	
	@Column(name = "assigned_at")
	@Temporal(TemporalType.TIMESTAMP)
	@UpdateTimestamp
	private Date assignedAt; 
}
