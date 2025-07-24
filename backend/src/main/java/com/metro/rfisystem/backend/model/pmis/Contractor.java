package com.metro.rfisystem.backend.model.pmis;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "contractor")
@Data
public class Contractor {
	@Id
    @Column(name = "contractor_id")
    private String contractorId;

    @Column(name = "contractor_name")
    private String contractorName;

    @Column(name = "email_id")
    private String emailId;
	
	

}
