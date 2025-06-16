package com.metro.rfisystem.backend.model.pmis;



import java.util.List;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "project")
public class Project {
	@Id
    @Column(name = "project_id", length = 15, nullable = false)
    private String projectId;
 
    @Column(name = "project_name", length = 60)
    private String projectName;
 
    @Column(name = "plan_head_number", length = 10)
    private String planHeadNumber;
 
    @Column(name = "pink_book_item_number", length = 30)
    private String pinkBookItemNumber;
 
    @Column(name = "remarks", length = 1000)
    private String remarks;
 
    @Column(name = "project_description", length = 200)
    private String projectDescription;
 
    @Column(name = "project_status", length = 10)
    private String projectStatus;
 
    @Column(name = "attachment", length = 100)
    private String attachment;
 
    @Column(name = "benefits", length = 1000)
    private String benefits;
 
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Work> works;
}



