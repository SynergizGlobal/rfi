package com.metro.rfisystem.backend.model.pmis;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "[user]")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

	@Id
	@Column(name = "user_id", length = 45, nullable = false)
	private String userId;

	@Column(name = "user_name", length = 120)
	private String userName;

	@Column(name = "password", length = 300)
	private String password;

	@Column(name = "designation", length = 100)
	private String designation;

	@Column(name = "email_id", length = 60)
	private String emailId;

	@Column(name = "mobile_number")
	private Long mobileNumber;

	@Column(name = "personal_contact_number")
	private Double personalContactNumber;

	@Column(name = "landline")
	private Double landline;

	@Column(name = "extension")
	private Double extension;

	@Column(name = "department_fk", length = 45)
	private String departmentFk;

	@Column(name = "reporting_to_id_srfk", length = 45)
	private String reportingToIdSrfk;

	@Column(name = "pmis_key_fk", length = 45)
	private String pmisKeyFk;

	@Column(name = "user_role_name_fk", length = 45)
	private String userRoleNameFk;

	@Column(name = "user_type_fk", length = 45)
	private String userTypeFk;

	@Column(name = "remarks", length = 1000)
	private String remarks;

	@Column(name = "user_image", length = 100)
	private String userImage;

	@Column(name = "single_login_session_id", length = 50)
	private String singleLoginSessionId;

	@Column(name = "is_password_encrypted", length = 5)
	private String isPasswordEncrypted;

	@Column(name = "is_test_env_enabled", length = 5)
	private String isTestEnvEnabled;

}
