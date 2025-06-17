package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
						   SELECT
			distinct a.component_id
			FROM
			    p6_activities a
			LEFT JOIN
			    structure s11 ON s11.structure_id = a.structure_id_fk
			WHERE
			    a.p6_activity_id IS NOT NULL
			    AND (a.component_details != 'OBC' OR a.component_details IS NULL)
			    AND a.scope <> ISNULL(a.completed, 0)
			    AND s11.structure_type_fk = :structureType
			    AND s11.structure = :structure
			    AND a.component = :component;
						    """, nativeQuery = true)
	List<String> findElementByStructureTypeAndStructureAndComponent(@Param("structureType") String structureType,
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
			 AND a.scope <> ISNULL(a.completed, 0)
			 AND s11.structure_type_fk = :structureType
			 AND s11.structure = :structure
			 AND a.component = :component
			 aND a.component_id = :component_id;
						    """, nativeQuery = true)
	List<String> findActivityNamesByStructureTypeAndStructureAndComponentAndCompId(
			@Param("structureType") String structureType, @Param("structure") String structure,
			@Param("component") String component, @Param("component_id") String component_id);

}
