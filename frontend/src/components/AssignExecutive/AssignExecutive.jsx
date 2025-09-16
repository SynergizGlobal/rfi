import React, { useState, useEffect,useRef  } from "react";
import Select from "react-select";
import axios from "axios";
import HeaderRight from "../HeaderRight/HeaderRight";
import "./AssignExecutive.css";
import { useLocation } from "react-router-dom";

const AssignExecutive = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

  const [formState, setFormState] = useState({
    project: "",
    projectId: "",
    work: "",
    contract: "",
    contractId: "",
    structureType: "",
    structure: "",
    executive: "",
    dyHodUserId: "",
    department: "",
    userId: ""
  });

  const [errors, setErrors] = useState({}); // ✅ error state
  const tableRef = useRef(null); 
  const [projectOptions, setProjectOptions] = useState([]);
  const [projectIdMap, setProjectIdMap] = useState({});
  const [workOptions, setWorkOptions] = useState([]);
  const [workIdMap, setWorkIdMap] = useState({});
  const [contractOptions, setContractOptions] = useState([]);
  const [contractIdMap, setContractIdMap] = useState({});
  const [structureTypeOptions, setStructureTypeOptions] = useState([]);
  const [structureOptions, setStructureOptions] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [rfiIds, setRfiIds] = useState([]);

  const [assignments, setAssignments] = useState([]);

  const [message, setMessage] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const isEditable = true;

  const filteredData = assignments.filter((item) => {
    return (
      item.contract?.toString().includes(searchTerm.toLowerCase()) ||
      item.structureType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.structure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedExecutive?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}rfi/getAssinedExecutiveLogs`);
      setAssignments(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching assignments:", error);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}rfi/projectNames`)
      .then((response) => {
        const options = response.data.map((project) => ({
          value: project.projectName,
          label: project.projectName
        }));

        const map = {};
        response.data.forEach((project) => {
          map[project.projectName] = project.projectId;
        });

        setProjectOptions(options);
        setProjectIdMap(map);
      })
      .catch((error) => {
        console.error("Error fetching project names:", error);
      });
  }, [API_BASE_URL]);

  const fetchExecutives = async ( structureType, structure) => {
    try {
      const response = await axios.get(`${API_BASE_URL}rfi/getExecutivesList`, {
        params: { structureType, structure }
      });

      setExecutives(
        response.data.map((exec) => ({
          value: exec.userName,
          label: `${exec.department} - ${exec.userName}`,
          department: exec.department,
          userId: exec.userId   
        }))
      );
    } catch (error) {
      console.error("Error fetching executives:", error);
    }
  };


  // ✅ Validation function
  // ✅ Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formState.project) newErrors.project = "Project is required";
    if (!formState.work) newErrors.work = "Work is required";
    if (!formState.contract) newErrors.contract = "Contract is required";
    if (!formState.structureType) newErrors.structureType = "Structure Type is required";
    if (!formState.structure) newErrors.structure = "Structure is required";
    if (!formState.executive) newErrors.executive = "Executive is required";

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      // Focus first invalid field
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        const el = document.querySelector(`[name="${firstErrorField}"] input`);
        el?.focus();
      }
      return;
    }

    const payload = {
      contract: formState.contract,
      contractId: formState.contractId,
      structureType: formState.structureType,
      structure: formState.structure,
      assignedPersonClient: formState.executive.value,
      department: formState.department,
	  userId:formState.userId
    };

    try {
      const response = await axios.post(`${API_BASE_URL}rfi/assign-executive`, payload);

      if (response.status === 200) {
        if (response.data.includes("successfully")) {
          alert("✅ " + response.data);
          fetchAssignments();
          setFormState({
            project: "",
            projectId: "",
            work: "",
            contract: "",
            contractId: "",
            structureType: "",
            structure: "",
            executive: "",
            dyHodUserId: "",
            department: "",
			  rfiId: ""
		  });
			  setErrors({});
			  setTimeout(() => {
				  tableRef.current?.scrollIntoView({ behavior: "smooth" });
			  }, 300);
		  } else {
			  alert("⚠️ " + response.data);
		  }
	  } else {
		  alert("⚠️ Unexpected response from server");
      }
    } catch (error) {
      console.error("❌ Error assigning Executive:", error);
      if (error.response) {
        alert("Server error: " + error.response.data);
      } else {
        alert("Failed to assign Executive...!");
      }
    }
  };


  return (
    <div className="dashboard credted-rfi inspection assign-executive">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">ASSIGN EXECUTIVE PAGE</h2>

            {/* 🔹 Assignment Form */}
            <form className="assign-form" onSubmit={handleSubmit}>
              {/* Project */}
              <div className="form-group">
                <label>Project</label>
                {errors.project && <div className="error-text">{errors.project}</div>}
                <Select
                  name="project"
                  options={projectOptions}
                  value={formState.project ? { value: formState.project, label: formState.project } : null}
                  onChange={(selected) => {
                    const proj = selected?.value || "";
                    const projId = projectIdMap[proj] || "";

                    setFormState({
                      ...formState,
                      project: proj,
                      projectId: projId,
                      work: "",
                      contract: "",
                      contractId: "",
                      structureType: "",
                      structure: "",
                      rfiId: "",
                      executive: "",
                    });
					setErrors((prev) => ({ ...prev, project: "" }));

                    setWorkOptions([]);
                    setContractOptions([]);
                    setStructureTypeOptions([]);
                    setStructureOptions([]);
                    setExecutives([]);
                    setRfiIds?.([]);

                    if (projId) {
                      axios
                        .get(`${API_BASE_URL}rfi/workNames`, { params: { projectId: projId } })
                        .then((res) => {
                          const map = {};
                          const opts = res.data.map((w) => {
                            map[w.workName] = w.workId;
                            return { value: w.workName, label: w.workName };
                          });
                          setWorkOptions(opts);
                          setWorkIdMap(map);
                        });
                    }
                  }}
                  isDisabled={!isEditable}
                />
              </div>

              {/* Work */}
              <div className="form-group">
                <label>Work</label>
                {errors.work && <div className="error-text">{errors.work}</div>}
                <Select
                  name="work"
                  options={workOptions}
                  value={formState.work ? workOptions.find((w) => w.value === formState.work) : null}
                  onChange={(selected) => {
                    const work = selected?.value || "";
                    const workId = workIdMap[work] || "";

                    setFormState({
                      ...formState,
                      work,
                      contract: "",
                      contractId: "",
                      structureType: "",
                      structure: "",
                      rfiId: "",
                      executive: "",
                    });
					setErrors((prev) => ({ ...prev, work: "" }));

                    setContractOptions([]);
                    setStructureTypeOptions([]);
                    setStructureOptions([]);
                    setExecutives([]);
                    setRfiIds?.([]);

                    if (workId) {
                      axios
                        .get(`${API_BASE_URL}rfi/contractNames`, { params: { workId } })
                        .then((res) => {
                          const map = {};
                          const opts = res.data.map((c) => {
                            map[c.contractShortName] = c.contractIdFk.trim();
                            return {
                              value: c.contractShortName,
                              label: c.contractShortName,
                              dyHodUserId: c.dyHodUserId?.trim(),
                            };
                          });
                          setContractOptions(opts);
                          setContractIdMap(map);
                        });
                    }
                  }}
                  isDisabled={!isEditable}
                />
              </div>

              {/* Contract */}
              <div className="form-group">
                <label>Contract</label>
                {errors.contract && <div className="error-text">{errors.contract}</div>}
                <Select
                  name="contract"
                  options={contractOptions}
                  value={formState.contract ? contractOptions.find((c) => c.value === formState.contract) : null}
                  onChange={(selected) => {
                    const name = selected?.value || "";
                    const id = contractIdMap[name] || "";

                    setFormState({
                      ...formState,
                      contract: name,
                      contractId: id,
                      dyHodUserId: selected?.dyHodUserId || "",
                      structureType: "",
                      structure: "",
                      rfiId: "",
                      executive: "",
                    });
					setErrors((prev) => ({ ...prev, contract: "" }));

                    setStructureTypeOptions([]);
                    setStructureOptions([]);
                    setExecutives([]);
                    setRfiIds?.([]);

                    if (id) {
                      axios
                        .get(`${API_BASE_URL}rfi/structureType`, { params: { contractId: id } })
                        .then((res) =>
                          setStructureTypeOptions(res.data.map((t) => ({ value: t, label: t })))
                        );
                    }
                  }}
                  isDisabled={!isEditable}
                />
              </div>

              {/* Structure Type */}
              <div className="form-group">
                <label>Structure Type</label>
                {errors.structureType && <div className="error-text">{errors.structureType}</div>}
                <Select
                  name="structureType"
                  options={structureTypeOptions}
                  value={formState.structureType ? structureTypeOptions.find((s) => s.value === formState.structureType) : null}
                  onChange={async (selected) => {
                    const type = selected?.value || "";

                    setFormState({
                      ...formState,
                      structureType: type,
                      structure: "",
                      rfiId: "",
                      executive: "",
                    });
					setErrors((prev) => ({ ...prev, structureType: "" }));
                    setStructureOptions([]);
                    setExecutives([]);
                    setRfiIds?.([]);

                    if (formState.contractId && type) {
                      try {
                        const res = await axios.get(`${API_BASE_URL}rfi/structure`, {
                          params: { contractId: formState.contractId, structureType: type },
                        });
                        setStructureOptions(res.data.map((s) => ({ value: s, label: s })));
                      } catch (err) {
                        console.error("❌ Error fetching structures:", err);
                        setStructureOptions([]);
                      }
                    }
                  }}
                  isDisabled={!isEditable}
                />
              </div>

              {/* Structure */}
              <div className="form-group">
                <label>Structure</label>
                {errors.structure && <div className="error-text">{errors.structure}</div>}
                <Select
                  name="structure"
                  options={structureOptions}
                  value={formState.structure ? structureOptions.find((s) => s.value === formState.structure) : null}
                  onChange={(selected) => {
                    const newStructure = selected?.value || "";
                    const { contractId, structureType } = formState;

                    setFormState({
                      ...formState,
                      structure: newStructure,
                      rfiId: "",
                      executive: "",
                    });
					setErrors((prev) => ({ ...prev, structure: "" }));
                    setExecutives([]);
                    setRfiIds?.([]);

                    if (contractId && structureType && newStructure) {
                      fetchExecutives( structureType, newStructure);
                    }
                  }}
                  isDisabled={!isEditable}
                />
              </div>

              {/* Executive */}
			  <div className="form-group">
			    <label>Assign Executive</label>
			    {errors.executive && <div className="error-text">{errors.executive}</div>}
				<Select
				  name="executive"
				  options={executives}
				  value={
				    formState.executive
				      ? executives.find((e) => e.value === formState.executive.value)
				      : null
				  }
				  onChange={(selected) => {
				    setFormState({
				      ...formState,
				      executive: selected,
				      department: selected?.department || "",
				      userId: selected?.userId || ""   // ✅ now matches
				    });
				    if (selected) {
				      setErrors((prev) => ({ ...prev, executive: "" }));
				    }
				  }}
				/>
			  </div>


              <button type="submit" className="save-btn">
                Submit
              </button>
            </form>

            {message && <p className="error">{message}</p>}

            {/* 🔹 Table */}
            <div className="assigned-rfi-table"  ref={tableRef}>
              <h2 className="section-heading">ASSIGN EXECUTIVE LOG</h2>

              <div className="table-controls">
                <div className="entries">
                  Show{" "}
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>{" "}
                  entries
                </div>

                <div className="search">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Structure Type</th>
                    <th>Structure</th>
                    <th>Assigned Executive</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((assignments, idx) => (
                      <tr key={idx}>
                        <td>{assignments.contract}</td>
                        <td>{assignments.structureType}</td>
                        <td>{assignments.structure}</td>
                        <td>{assignments.assignedExecutive}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        No assignments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="table-footer">
                <div className="info">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </div>
                <div className="pagination">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    Prev
                  </button>
                  <span> Page {currentPage} of {totalPages} </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignExecutive;
