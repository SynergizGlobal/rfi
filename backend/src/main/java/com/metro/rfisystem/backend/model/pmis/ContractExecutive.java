package com.metro.rfisystem.backend.model.pmis;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "contract_executive")
@Data
public class ContractExecutive {
	
	 @Id
	@Column(name = "contract_id_fk")
    private String contractIdFk;

    @Column(name = "department_id_fk")
    private String departmentIdFk;

    @Column(name = "executive_user_id_fk")
    private String executiveUserIdFk;

}
