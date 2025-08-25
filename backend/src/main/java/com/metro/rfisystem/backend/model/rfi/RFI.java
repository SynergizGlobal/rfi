package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDate;


import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "rfi_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"inspectionDetails", "rfiValidation"})
public class RFI {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;
	private String rfi_Id;
	@Column(name = "project_name")
	private String project;
	@Column(name = "work_short_name")
	private String work;
	@Column(name = "contract_short_name")
	private String contract;

	@Column(name = "structure_type")
	private String structureType;

	private String structure;
	private String component;
	private String element;
	private String activity;

	@Column(name = "rfi_description", length = 1000)
	private String rfiDescription;

	private String action;

	@Column(name = "type_of_rfi")
	private String typeOfRFI;

	@Column(name = "name_of_representative")
	private String nameOfRepresentative;

	@Column(length = 1000)
	private String enclosures;

	private String location;

	@Column(length = 1000)
	private String description;

	@Column(name = "time_of_inspection")
	@JsonFormat(pattern = "HH:mm")
	private LocalTime timeOfInspection;

	@Column(name = "date_of_submission")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate dateOfSubmission;

	@Column(name = "date_of_inspection")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate dateOfInspection;
	@Column(name = "created_at", updatable = false)
	@Temporal(TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createdAt;

	@Column(name = "updated_at")
	@Temporal(TemporalType.TIMESTAMP)
	@UpdateTimestamp
	private Date updatedAt;

	@Column(name = "created_by")
	private String createdBy;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private EnumRfiStatus status;
	
	@Column(name = "assigned_person_client")
	private String assignedPersonClient;
	
	@Column(name = "client_department")
	private String clientDepartment;
 
	
    @Column(name = "assigned_person_contractor")
    private String assignedPersonContractor;
    
    @Column(name="contract_id")
    private String contractId;
    
    @Column(name = "dy_hod_user_id")
    private String dyHodUserId;
    
    @Column(name = "measurement_type")
    private String measurementType;

    @Column(name = "measurement_value")
    private String measurementValue;

	@OneToOne(mappedBy = "rfi", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private RfiValidation rfiValidation;

	@OneToMany(mappedBy = "rfi", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<RFIInspectionDetails> inspectionDetails = new ArrayList<>();
	
    @OneToMany(mappedBy = "rfi", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RFIChecklistItem> checklistItems = new ArrayList<>();
 
    @OneToMany(mappedBy = "rfi", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RFIEnclosure> enclosure = new ArrayList<>();
    
    public List<String> getEnclosuresList() {
        return (enclosures != null && !enclosures.isEmpty())
                ? Arrays.asList(enclosures.split(","))
                : new ArrayList<>();
    }

    public void setEnclosuresList(List<String> enclosuresList) {
        this.enclosures = (enclosuresList != null && !enclosuresList.isEmpty())
                ? String.join(",", enclosuresList)
                : null;
    }

}