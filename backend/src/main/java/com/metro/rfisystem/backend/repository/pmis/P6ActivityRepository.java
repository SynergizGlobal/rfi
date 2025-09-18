package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.ExecutiveDTO;
import com.metro.rfisystem.backend.dto.TaskCodeRequestDto;
import com.metro.rfisystem.backend.model.pmis.P6Activity;

public interface P6ActivityRepository extends JpaRepository<P6Activity, Integer> {

	@Query(value = """
						   SELECT component AS strip_chart_component
			FROM p6_activities a
			LEFT JOIN structure s ON s.structure_id = a.structure_id_fk
			WHERE
			    component IS NOT NULL
			    AND component <> ''
			    AND (component_details != 'OBC' OR component_details IS NULL)
			    AND a.contract_id_fk = :contractId
			    AND structure_type_fk = :structureType
			    AND structure = :structure
			GROUP BY component;
						    """, nativeQuery = true)
	List<String> findComponentByStructureTypeAndContractIdAndStructure(@Param("structureType") String structureType,
			@Param("contractId") String contractId, @Param("structure") String structure);

	@Query(value = """
						   	SELECT DISTINCT
    component_id AS strip_chart_component_id_name
FROM p6_activities a
LEFT JOIN structure s ON s.structure_id = a.structure_id_fk
WHERE component_id IS NOT NULL
  AND (component_details != 'OBC' OR component_details IS NULL)
  AND component_id <> ''
  AND a.contract_id_fk = :contractId
  AND s.structure_type_fk = :structureType
  AND s.structure = :structure
  AND component = :component
						    """, nativeQuery = true)
	List<String> findElementByStructureTypeAndStructureAndComponent(@Param("contractId") String contractId,@Param("structureType") String structureType,
			@Param("structure") String structure, @Param("component") String component);

	@Query(value = """
						   SELECT
			distinct a.p6_activity_name
			FROM
			 p6_activities a
			LEFT JOIN
			 structure s11 ON s11.structure_id = a.structure_id_fk
			WHERE
			 a.p6_activity_id IS NOT NULL
			 AND (a.component_details != 'OBC' OR a.component_details IS NULL)
			 AND s11.structure_type_fk = :structureType
			 AND s11.structure = :structure
			 AND a.component = :component
			 aND a.component_id = :component_id;
						    """, nativeQuery = true)
	List<String> findActivityNamesByStructureTypeAndStructureAndComponentAndCompId(
			@Param("structureType") String structureType, @Param("structure") String structure,
			@Param("component") String component, @Param("component_id") String component_id);

	@Query(value = """
			SELECT
			    u.user_name AS userName,
			    u.user_id AS userId,
			    d.department_name AS department
			FROM [user] u
			INNER JOIN department d
			    ON u.department_fk = d.department
			INNER JOIN structure_contract_responsible_people sp
			    ON sp.responsible_people_id_fk = u.user_id
			INNER JOIN structure struct
			    ON sp.structure_id_fk = struct.structure_id
			WHERE u.user_name NOT LIKE '%user%'
			  AND u.pmis_key_fk NOT LIKE '%SGS%'
			  AND u.department_fk IN ('Engg','Elec','S&T')
			  AND (u.user_name IS NOT NULL AND u.user_name <> '')
			  AND struct.structure_type_fk = :structureType
			  AND struct.structure = :structure
			ORDER BY
			    CASE WHEN u.user_type_fk='HOD' THEN 1
			         WHEN u.user_type_fk='DYHOD' THEN 2
			         WHEN u.user_type_fk='Officers ( Jr./Sr. Scale )' THEN 3
			         WHEN u.user_type_fk='Others' THEN 4
			    END ASC,
			    CASE WHEN u.designation='ED Civil' THEN 1
			         WHEN u.designation='CPM I' THEN 2
			         WHEN u.designation='CPM II' THEN 3
			         WHEN u.designation='CPM III' THEN 4
			         WHEN u.designation='CPM V' THEN 5
			         WHEN u.designation='CE' THEN 6
			         WHEN u.designation='ED S&T' THEN 7
			         WHEN u.designation='CSTE' THEN 8
			         WHEN u.designation='GM Electrical' THEN 9
			         WHEN u.designation='CEE Project I' THEN 10
			         WHEN u.designation='CEE Project II' THEN 11
			         WHEN u.designation='ED Finance & Planning' THEN 12
			         WHEN u.designation='AGM Civil' THEN 13
			         WHEN u.designation='DyCPM Civil' THEN 14
			         WHEN u.designation='DyCPM III' THEN 15
			         WHEN u.designation='DyCPM V' THEN 16
			         WHEN u.designation='DyCE EE' THEN 17
			         WHEN u.designation='DyCE Badlapur' THEN 18
			         WHEN u.designation='DyCPM Pune' THEN 19
			         WHEN u.designation='DyCE Proj' THEN 20
			         WHEN u.designation='DyCEE I' THEN 21
			         WHEN u.designation='DyCEE Projects' THEN 22
			         WHEN u.designation='DyCEE PSI' THEN 23
			         WHEN u.designation='DyCSTE I' THEN 24
			         WHEN u.designation='DyCSTE IT' THEN 25
			         WHEN u.designation='DyCSTE Projects' THEN 26
			         WHEN u.designation='XEN Consultant' THEN 27
			         WHEN u.designation='AEN Adhoc' THEN 28
			         WHEN u.designation='AEN Project' THEN 29
			         WHEN u.designation='AEN P-Way' THEN 30
			         WHEN u.designation='AEN' THEN 31
			         WHEN u.designation='Sr Manager Signal' THEN 32
			         WHEN u.designation='Manager Signal' THEN 33
			         WHEN u.designation='Manager Civil' THEN 34
			         WHEN u.designation='Manager OHE' THEN 35
			         WHEN u.designation='Manager GS' THEN 36
			         WHEN u.designation='Manager Finance' THEN 37
			         WHEN u.designation='Planning Manager' THEN 38
			         WHEN u.designation='Manager Project' THEN 39
			         WHEN u.designation='Manager' THEN 40
			         WHEN u.designation='SSE' THEN 41
			         WHEN u.designation='SSE Project' THEN 42
			         WHEN u.designation='SSE Works' THEN 43
			         WHEN u.designation='SSE Drg' THEN 44
			         WHEN u.designation='SSE BR' THEN 45
			         WHEN u.designation='SSE P-Way' THEN 46
			         WHEN u.designation='SSE OHE' THEN 47
			         WHEN u.designation='SPE' THEN 48
			         WHEN u.designation='PE' THEN 49
			         WHEN u.designation='JE' THEN 50
			         WHEN u.designation='Demo-HOD-Elec' THEN 51
			         WHEN u.designation='Demo-HOD-Engg' THEN 52
			         WHEN u.designation='Demo-HOD-S&T' THEN 53
			    END ASC;
						""", nativeQuery = true)
	List<ExecutiveDTO> getExcecutives(String structureType, String structure);
	
	@Query(value = "SELECT TOP 1 task_code FROM activities_view " +
	        "WHERE contract_id = :#{#dto.contractId} " +
	        "AND structure_type = :#{#dto.structureType} " +
	        "AND structure = :#{#dto.structure} " +
	        "AND component = :#{#dto.component} " +
	        "AND component_id = :#{#dto.element} " +
	        "AND activity_name = :#{#dto.activityName} " +
	        "ORDER BY last_updated_date DESC",
	        nativeQuery = true)
	Optional<String> getTaskCodeforSelectedDetails(@Param("dto") TaskCodeRequestDto dto);



}
