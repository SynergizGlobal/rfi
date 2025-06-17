package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.model.pmis.Work;

public interface WorkRepository extends JpaRepository<Work, String> {

	@Query(value = """
			SELECT DISTINCT w.work_short_name,w.work_id
			FROM contract c
			LEFT OUTER JOIN work w ON c.work_id_fk = w.work_id
			WHERE c.contract_id IN (
			    SELECT a.contract_id_fk
			    FROM p6_activities a
			    WHERE a.contract_id_fk IS NOT NULL
			    GROUP BY a.contract_id_fk
			)
			AND (:projectId IS NULL OR w.project_id_fk = :projectId)
			ORDER BY w.work_short_name ASC
			""", nativeQuery = true)
	List<String> findDistinctWorkShortNamesByProjectId(@Param("projectId") String projectId);

}
