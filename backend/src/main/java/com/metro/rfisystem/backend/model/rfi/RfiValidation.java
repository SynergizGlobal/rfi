package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.metro.rfisystem.backend.constants.EnumValidation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RfiValidation {
	
	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToOne
	@JsonBackReference
    @JoinColumn(name = "rfi_id_fk", referencedColumnName = "id")
    private RFI rfi;
	
	@Column(name = "sent_for_validation_at", columnDefinition = "TIMESTAMP")
	private LocalDateTime sentForValidationAt;

	@Column(name = "remarks",nullable = true)
	private String Remarks;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "action")
	private EnumValidation enumValidation;

	@Column
	private String DscFilePath;
}
