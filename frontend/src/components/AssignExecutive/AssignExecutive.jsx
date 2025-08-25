import React, { useState, useEffect } from "react";
import Select from "react-select"; 
import axios from "axios";
import HeaderRight from "../HeaderRight/HeaderRight";
import "./AssignExecutive.css";
import { useLocation } from "react-router-dom";

const AssignExecutive = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

  // 🔹 State
  const [formState, setFormState] = useState({
    project: "",
    projectId: "",
    work: "",
    contract: "",
    contractId: "",
    structureType: "",
    structure: "",
    component: "",
    element: "",
    activity: "",
    dyHodUserId: "",
    executive: "",
    rfiId: "" 
  });

  const [projectOptions, setProjectOptions] = useState([]);
  const [projectIdMap, setProjectIdMap] = useState({});
  const [workOptions, setWorkOptions] = useState([]);
  const [workIdMap, setWorkIdMap] = useState({});
  const [contractOptions, setContractOptions] = useState([]);
  const [contractIdMap, setContractIdMap] = useState({});
  const [structureTypeOptions, setStructureTypeOptions] = useState([]);
  const [structureOptions, setStructureOptions] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [rfiIdOptions, setRfiIdOptions] = useState([]);

  const location = useLocation();
  const [mode, setMode] = useState("create");
  const [message, setMessage] = useState("");

  const isEditable = true;

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

  useEffect(() => {
    const { project, work, contract, structureType, structure } = formState;
    if (project && work && contract && structureType && structure) {
      axios
        .get(`${API_BASE_URL}rfi/rfiIds`, {
          params: { project, work, contract, structureType, structure }
        })
        .then((res) => {
          const opts = res.data.map((r) => ({
            value: r.rfi_id,
            label: r.rfi_id
          }));
          setRfiIdOptions(opts);
        })
        .catch((err) => {
          console.error("❌ Error fetching RFI IDs:", err);
          setRfiIdOptions([]);
        });
    } else {
      setRfiIdOptions([]);
    }
  }, [
    formState.project,
    formState.work,
    formState.contract,
    formState.structureType,
    formState.structure
  ]);


 
  
  
  const fetchExecutives = async (contractId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}rfi/getExecutivesList`,
        { params: { contractId } }
      );

      setExecutives(
		response.data.map((exec) => ({
		   value: exec.userName,
		   label: `${exec.department} - ${exec.userName}`, 
		   department: exec.department
		 }))
      );
    } catch (error) {
      console.error("Error fetching executives:", error);
    }
  };


  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
		const payload = {
		  rfi_Id: formState.rfiId,
		  assignedPersonClient: formState.executive?.value,
		  clientDepartment: formState.executive?.department
		};

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${API_BASE_URL}rfi/assign-client-person`,
        payload
      );

      alert(response.data); // "Assigned successfully"
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to assign person");
    }
  };


  return (
    <div className="dashboard credted-rfi inspection assign-executive">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">Assign Executives</h2>

            <form className="assign-form" onSubmit={handleSubmit}>
              {/* Project */}
              <div className="form-group">
                <label>Project</label>
                <Select
                  options={projectOptions}
                  value={
                    formState.project
                      ? { value: formState.project, label: formState.project }
                      : null
                  }
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
                      executive: ""
                    });
                    if (projId) {
                      axios
                        .get(`${API_BASE_URL}rfi/workNames`, {
                          params: { projectId: projId }
                        })
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
                <Select
                  options={workOptions}
                  value={
                    formState.work
                      ? workOptions.find((w) => w.value === formState.work)
                      : null
                  }
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
                      executive: ""
                    });
                    if (workId) {
                      axios
                        .get(`${API_BASE_URL}rfi/contractNames`, {
                          params: { workId }
                        })
                        .then((res) => {
                          const map = {};
                          const opts = res.data.map((c) => {
                            map[c.contractShortName] = c.contractIdFk.trim();
                            return {
                              value: c.contractShortName,
                              label: c.contractShortName,
                              dyHodUserId: c.dyHodUserId?.trim()
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
                <Select
                  options={contractOptions}
                  value={
                    formState.contract
                      ? contractOptions.find(
                          (c) => c.value === formState.contract
                        )
                      : null
                  }
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
                      executive: ""
                    });
                    if (id) {
                      axios
                        .get(`${API_BASE_URL}rfi/structureType`, {
                          params: { contractId: id }
                        })
                        .then((res) =>
                          setStructureTypeOptions(
                            res.data.map((t) => ({ value: t, label: t }))
                          )
                        );
                      fetchExecutives(id);
                    }
                  }}
                  isDisabled={!isEditable}
                />
              </div>
			  {/* Structure Type */}
			  <div className="form-group">
			    <label>Structure Type</label>
			    <Select
			      options={structureTypeOptions}
			      value={
			        formState.structureType
			          ? structureTypeOptions.find(
			              (s) => s.value === formState.structureType
			            )
			          : null
			      }
			      onChange={async (selected) => {
			        const type = selected?.value || "";
			        setFormState({
			          ...formState,
			          structureType: type,
			          structure: "",
			          rfiId: "",
			          executive: ""
			        });

			        // 🔹 Fetch structures dynamically when structureType changes
			        if (formState.contractId && type) {
			          try {
			            const res = await axios.get(`${API_BASE_URL}rfi/structure`, {
			              params: { contractId: formState.contractId, structureType: type }
			            });
			            setStructureOptions(res.data.map((s) => ({ value: s, label: s })));
			          } catch (err) {
			            console.error("❌ Error fetching structures:", err);
			            setStructureOptions([]);
			          }
			        } else {
			          setStructureOptions([]);
			        }
			      }}
			      isDisabled={!isEditable}
			    />
			  </div>


              {/* Structure */}
              <div className="form-group">
                <label>Structure</label>
                <Select
                  options={structureOptions}
                  value={
                    formState.structure
                      ? structureOptions.find(
                          (s) => s.value === formState.structure
                        )
                      : null
                  }
                  onChange={(selected) =>
                    setFormState({
                      ...formState,
                      structure: selected?.value || "",
                      rfiId: "",
                      executive: ""
                    })
                  }
                  isDisabled={!isEditable}
                />
              </div>

              {/* RFI ID */}
              <div className="form-group">
                <label>RFI ID</label>
                <Select
                  options={rfiIdOptions}
                  value={
                    formState.rfiId
                      ? { value: formState.rfiId, label: formState.rfiId }
                      : null
                  }
                  onChange={(selected) =>
                    setFormState({
                      ...formState,
                      rfiId: selected?.value || ""
                    })
                  }
                  isDisabled={!isEditable}
                />
              </div>

			  <button type="submit" className="save-btn">
			    Submit
			  </button>
              {/* Executive */}
              <div className="form-group">
                <label>Assign Executive</label>
				<Select
				  options={executives}
				  value={formState.executive}   // directly use stored object
				  onChange={(selected) => {
				    console.log("Selected executive:", selected);
				    setFormState({
				      ...formState,
				      executive: selected, // store full object
				      department: selected?.department || ""
				    });
				  }}
				/>


              </div>


            </form>

            {message && <p className="error">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignExecutive;
