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
	List<String> findElementByStructureTypeAndStructureAndComponent(@Param("contractId") String contractId,
			@Param("structureType") String structureType, @Param("structure") String structure,
			@Param("component") String component);

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
				select distinct u.user_name AS userName,
			    u.user_id AS userId, d.department_name  from contract c
			left join contract_executive e on e.contract_id_fk=c.contract_id
			left join [user] u on u.user_id=e.executive_user_id_fk
			INNER JOIN department d
			    ON u.department_fk = d.department
			where c.contract_id=:contractId and user_type_fk like '%Officer%' 
			and user_role_name_fk not like '%super%' and user_role_name_fk not like '%hod%'
""", nativeQuery = true)
	List<ExecutiveDTO> getExcecutives(String contractId);

	@Query(value = "SELECT TOP 1 task_code FROM activities_view " + "WHERE contract_id = :#{#dto.contractId} "
			+ "AND structure_type = :#{#dto.structureType} " + "AND structure = :#{#dto.structure} "
			+ "AND component = :#{#dto.component} " + "AND component_id = :#{#dto.element} "
			+ "AND activity_name = :#{#dto.activityName} " + "ORDER BY last_updated_date DESC", nativeQuery = true)
	Optional<String> getTaskCodeforSelectedDetails(@Param("dto") TaskCodeRequestDto dto);

}
