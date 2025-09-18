import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import HeaderRight from '../HeaderRight/HeaderRight';
import './CreateRfi.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const CreateRfi = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({});
	const [mode, setMode] = useState('create');
	const [loading, setLoading] = useState(true);
	const [allowedContractNames, setAllowedContractNames] = useState(new Set());
	const [errors, setErrors] = useState({});


	const [isEditable, setIsEditable] = useState(mode?.toLowerCase() !== 'edit');
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	const getTodayISO = () => new Date().toISOString().split('T')[0];

	const { id, status } = location.state || {};

	const [actions, setActions] = useState([]);

	useEffect(() => {
		if (status === "INSPECTION_DONE") {
			setActions(["Reschedule", "Reassign"]);
		} else {
			setActions(["Reschedule", "Update", "Reassign"]);
		}
	}, [status]);

	useEffect(() => {
	  setIsEditable(mode?.toLowerCase() !== "edit");
	}, [mode]);

	// Unified helper (replaces isFieldDisabled)
	const getDisabledStatus = (step, field) => {
	  // ✅ If not in edit mode → always editable
	  if (mode?.toLowerCase() !== "edit") return false;

	  const action = formState.action;

	  // ✅ If no action selected yet (Step 2 & 3) → only Action enabled
	  if ((step === 2 || step === 3) && !action) {
	    return field !== "action";
	  }

	  if (step === 2) {
	    if (action === "Reschedule") {
	      return !(field === "dateOfInspection" || field === "timeOfInspection");
	    }
	    if (action === "Reassign") {
	      return field !== "nameOfRepresentative";
	    }
	    if (action === "Update") {
	      return true; // all Step 2 disabled
	    }
	  }

	  if (step === 3) {
	    if (action === "Reschedule") {
	      return !(field === "dateOfInspection" || field === "timeOfInspection");
	    }
	    if (action === "Reassign") {
	      return field !== "nameOfRepresentative";
	    }
	    if (action === "Update") {
	      return !(field === "enclosures" || field === "description");
	    }
	  }

	  return false;
	};

	const [step, setStep] = useState(1);
	const [formState, setFormState] = useState({
		project: '',
		work: '',
		contract: '',
		contractId: '',
		structureType: '',
		structure: '',
		component: '',
		element: '',
		activity: '',
		rfiDescription: '',
		action: '',
		typeOfRFI: '',
		nameOfRepresentative: '',
		timeOfInspection: '',
		rfi_Id: '',
		dateOfSubmission: getTodayISO(),
		dateOfInspection: '',
		enclosures: [],
		location: '',
		description: '',
		dyHodUserId: ''

	});
	const [message, setMessage] = useState('');

	// To prevent multiple captures of initialData
	const initialCapturedRef = useRef(false);

	useEffect(() => {
	  if (mode === "edit" && formData && !initialCapturedRef.current) {
	    console.log("🔥 formData in useEffect:", formData);

	    // ✅ Normalizer: always return array
	    const normalizeToArray = (v) => {
	      if (!v) return [];
	      if (Array.isArray(v)) return v;
	      if (typeof v === "string") {
	        return v.split(",").map((s) => s.trim()).filter(Boolean);
	      }
	      return [];
	    };

	    const normalizedEnclosures = normalizeToArray(formData.enclosures);

	    // Set form state
	    setFormState({
	      project: formData.project || "",
	      work: formData.work || "",
	      contract: formData.contract || "",
	      structureType: formData.structureType || "",
	      structure: formData.structure || "",
	      component: formData.component || "",
	      element: formData.element || "",
	      activity: formData.activity || "",
	      rfiDescription: formData.rfiDescription || "",
	      action: formData.action || "",
	      typeOfRFI: formData.typeOfRFI || "",
	      nameOfRepresentative: formData.nameOfRepresentative || "",
	      timeOfInspection: formData.timeOfInspection || "",
	      rfi_Id: formData.rfi_Id || "",
	      dateOfSubmission: formData.dateOfSubmission || "",
	      dateOfInspection: formData.dateOfInspection || "",
	      enclosures: normalizedEnclosures, 
	      location: formData.location || "",
	      description: formData.description || "",
	    });

	    // Capture snapshot of original values (for Update validation)
	    setInitialData({
	      dateOfInspection: formData.dateOfInspection || "",
	      timeOfInspection: formData.timeOfInspection || "",
	      nameOfRepresentative: formData.nameOfRepresentative || "",
	      enclosuresList: normalizedEnclosures, // ✅ Always array
	    });

	    initialCapturedRef.current = true;

	    console.log("📌 Captured initialData:", {
	      dateOfInspection: formData.dateOfInspection,
	      timeOfInspection: formData.timeOfInspection,
	      nameOfRepresentative: formData.nameOfRepresentative,
	      enclosuresList: normalizedEnclosures,
	    });
	  }
	}, [mode, formData]);

	
	const [initialData, setInitialData] = useState({
		  	  dateOfInspection: "",
		  	  timeOfInspection: "",
		  	  nameOfRepresentative: ""
		  	});

			useEffect(() => {
			  console.log("📌 useEffect triggered, action:", formState.action);

			  if (formState.action === "Reschedule" || formState.action === "Reassign") {
			    const snapshot = {
			      dateOfInspection: formState.dateOfInspection || "",
			      timeOfInspection: formState.timeOfInspection || "",
			      nameOfRepresentative: formState.nameOfRepresentative || ""
			    };

			    console.log("📌 Snapshot initialData set:", snapshot);
			    setInitialData(snapshot);
			  }
			}, [formState.action]);


	const getMinInspectionDate = () => {
		const today = new Date();
		today.setDate(today.getDate() + 2); // ✅ Add 2 days
		return today.toISOString().split("T")[0];
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "dateOfSubmission") {
			const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
			if (value < today) {
				alert("Date of Submission should not be prior to today's date.");
				return; // stop further execution
			}
		}
		if (e.target.name === "dateOfInspection") {
			const today = new Date().toISOString().split("T")[0];
			if (value < today) {
				alert("Inspection date cannot be in the future.");
				return;
			}
		}
		setFormState({ ...formState, [name]: value });
	};

	const handleSubmit = async () => {
	  if (!validateStep2()) {
	    alert("Please fix validation errors before submitting.");
	    return;
	  }

	  setMessage('');
	  const url =
	    mode === 'edit'
	      ? `${API_BASE_URL}rfi/update/${location.state.id}`
	      : `${API_BASE_URL}rfi/create`;
	  const method = mode === 'edit' ? 'PUT' : 'POST';

	  let payload = { ...formState };

	  // 🔥 Normalize enclosures (string → array)
	  if (typeof payload.enclosures === "string") {
	    payload.enclosures = payload.enclosures
	      .split(",")
	      .map(e => e.trim())
	      .filter(e => e.length > 0);
	  }

	  // 🔥 Validation: for Update only, enclosures must be provided
	  if (
	    payload.action &&
	    payload.action.toLowerCase() === "update" &&
	    (!payload.enclosures || payload.enclosures.length === 0)
	  ) {
	    alert("Enclosures are required when action is Update.");
	    return;
	  }

	  console.log("🚀 Final payload before submit:", payload);
	  console.log(
	    "typeof enclosures after fix:",
	    typeof payload.enclosures,
	    Array.isArray(payload.enclosures)
	  );

	  try {
	    const response = await fetch(url, {
	      method: method,
	      headers: {
	        "Content-Type": "application/json",
	      },
	      credentials: "include",
	      body: JSON.stringify(payload),
	    });

	    if (!response.ok) {
	      const errorText = await response.text();
	      throw new Error(`Error: ${response.status} - ${errorText}`);
	    }

	    const message = await response.text();
	    setMessage(message);
	    alert(message);
	    navigate("/Dashboard");
	  } catch (error) {
	    console.error("Error submitting RFI:", error);
	    setMessage("❌ Failed to submit RFI. Please try again.");
	  }
	};


	const [loadingContracts, setLoadingContracts] = useState(true);

	useEffect(() => {
		const fetchContracts = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}rfi/allowedContracts`, {
					method: 'GET',
					credentials: 'include'
				});
				const data = await response.json();

				const allowedSet = new Set();
				data.forEach(c => allowedSet.add(c.contractShortName));
				setAllowedContractNames(allowedSet);
			} catch (err) {
				console.error('Failed to load allowed contract list:', err);
				setAllowedContractNames(new Set());
			}
		};

		fetchContracts();
	}, []);



	const [projectOptions, setProjectOptions] = useState([]);
	const [projectIdMap, setProjectIdMap] = useState({});
	const [workOptions, setWorkOptions] = useState([]);
	const [workIdMap, setWorkIdMap] = useState({});

	useEffect(() => {
		const state = location.state || {};
		const { mode: navMode, id } = state;

		if (navMode === 'edit' && id) {
			setMode('edit');

			axios.get(`${API_BASE_URL}rfi/rfi-details/${id}`)
				.then(async (res) => {
					const data = res.data;
					console.log("✅ Received RFI:", data);

					// 1. Set project first
					const projectId = projectIdMap[data.project];
					if (projectId) {
						const workRes = await axios.get(`${API_BASE_URL}rfi/workNames`, {
							params: { projectId }
						});

						const workOptions = workRes.data.map(work => ({
							value: work.workName,
							label: work.workName
						}));
						const workIdMap = {};
						workRes.data.forEach(work => {
							workIdMap[work.workName] = work.workId;
						});
						setWorkOptions(workOptions);
						setWorkIdMap(workIdMap);

						// 2. Set work → contract
						const workId = workIdMap[data.work];
						if (workId) {
							const contractRes = await axios.get(`${API_BASE_URL}rfi/contractNames`, {
								params: { workId }
							});
							const contractOptions = contractRes.data.map(c => ({
								value: c.contractShortName,
								label: c.contractShortName
							}));
							const contractIdMap = {};
							contractRes.data.forEach(c => {
								contractIdMap[c.contractShortName] = c.contractIdFk.trim();
							});
							setContractOptions(contractOptions);
							setContractIdMap(contractIdMap);

							// 3. contract → structureType
							const contractId = contractIdMap[data.contract];
							if (contractId) {
								const structureTypeRes = await axios.get(`${API_BASE_URL}rfi/structureType`, {
									params: { contractId }
								});
								const structureTypeOptions = structureTypeRes.data.map(type => ({
									value: type,
									label: type
								}));
								setStructureTypeOptions(structureTypeOptions);

								// 4. structure
								const structureRes = await axios.get(`${API_BASE_URL}rfi/structure`, {
									params: {
										contractId,
										structureType: data.structureType
									}
								});
								const structureOptions = structureRes.data.map(s => ({
									value: s,
									label: s
								}));
								setStructureOptions(structureOptions);

								// 5. component
								const componentRes = await axios.get(`${API_BASE_URL}rfi/component`, {
									params: {
										contractId,
										structureType: data.structureType,
										structure: data.structure
									}
								});
								const componentOptions = componentRes.data.map(c => ({
									value: c,
									label: c
								}));
								setComponentOptions(componentOptions);

								// 6. element
								const elementRes = await axios.get(`${API_BASE_URL}rfi/element`, {
									params: {
										structureType: data.structureType,
										structure: data.structure,
										component: data.component
									}
								});

								let elementOptions = elementRes.data.map(e => ({
									value: e,
									label: e
								}));

								// ✅ Fallback if API didn't return the current element
								if (
									elementOptions.length === 0 &&
									data.element &&
									!elementOptions.find(e => e.value === data.element)
								) {
									elementOptions = [{ value: data.element, label: data.element }];
								}

								setElementOptions(elementOptions);

								// ✅ Set the form state with existing element
								setFormState((prev) => ({
									...prev,
									element: data.element || '',
								}));

								// 7. activity
								const activityRes = await axios.get(`${API_BASE_URL}rfi/activityNames`, {
									params: {
										structureType: data.structureType,
										structure: data.structure,
										component: data.component,
										component_id: data.element
									}
								});
								const activityOptions = activityRes.data.map(a => ({
									value: a,
									label: a
								}));
								setActivityOptions(activityOptions);
							}
						}
					}

					// ✅ Finally set the form data
					setFormState({
						project: data.project || '',
						work: data.work || '',
						contract: data.contract || '',
						structureType: data.structureType || '',
						structure: data.structure || '',
						component: data.component || '',
						element: data.element || '',
						activity: data.activity || '',
						rfiDescription: data.rfiDescription || '',
						action: data.action || '',
						typeOfRFI: data.typeOfRFI || '',
						nameOfRepresentative: data.nameOfRepresentative || '',
						timeOfInspection: data.timeOfInspection || '',
						rfi_Id: data.rfi_Id || '',
						dateOfSubmission: data.dateOfSubmission || '',
						dateOfInspection: data.dateOfInspection || '',
						enclosures: data.enclosures || '',
						location: data.location || '',
						description: data.description || '',
					});
				})
				.catch((err) => {
					console.error('❌ Error fetching RFI:', err);
					setMessage('Failed to load RFI data.');
				});
		}
	}, [location.state, projectIdMap]);

	useEffect(() => {
		// eslint-disable-next-line no-template-curly-in-string
		axios.get(`${API_BASE_URL}rfi/projectNames`)
			.then(response => {
				const options = response.data.map(project => ({
					value: project.projectName,
					label: project.projectName
				}));

				const map = {};
				response.data.forEach(project => {
					map[project.projectName] = project.projectId;
				});

				setProjectOptions(options);
				setProjectIdMap(map);
			})
			.catch(error => {
				console.error('Error fetching project names:', error);
			});
	}, []);

	const [contractOptions, setContractOptions] = useState([]);
	const [contractIdMap, setContractIdMap] = useState({});



	const [structureTypeOptions, setStructureTypeOptions] = useState([]);

	const [structureOptions, setStructureOptions] = useState([]);

	useEffect(() => {
		const { contract, structureType } = formState;

		const contractId = contractIdMap[contract];

		if (contractId && structureType) {
			axios
				.get(`${API_BASE_URL}rfi/structure`, {
					params: {
						contractId: contractId,
						structureType: structureType
					}
				})
				.then(response => {
					console.log('Structure API response:', response.data);
					const options = response.data.map(structure => ({
						value: structure,
						label: structure
					}));
					setStructureOptions(options);
				})
				.catch(error => {
					console.error('Error fetching structure options:', error);
					setStructureOptions([]);
				});
		} else {
			setStructureOptions([]);
		}
	}, [formState.contract, formState.structureType, contractIdMap]);


	const [componentOptions, setComponentOptions] = useState([]);

	useEffect(() => {
		const { contract, structureType, structure } = formState;
		const contractId = contractIdMap[contract];

		if (contractId && structureType && structure) {
			axios
				.get(`${API_BASE_URL}rfi/component`, {
					params: {
						contractId: contractId,
						structureType: structureType,
						structure: structure
					}
				})
				.then(response => {
					console.log('Component API response:', response.data);
					const options = response.data.map(component => ({
						value: component,
						label: component
					}));
					setComponentOptions(options);
				})
				.catch(error => {
					console.error('Error fetching component options:', error);
					setComponentOptions([]);
				});
		} else {
			setComponentOptions([]);
		}
	}, [formState.contract, formState.structureType, formState.structure, contractIdMap]);


	const [elementOptions, setElementOptions] = useState([]);

	useEffect(() => {
		const { contractId, structureType, structure, component } = formState;

		if (structureType && structure && component) {
			axios
				.get(`${API_BASE_URL}rfi/element`, {
					params: {
						contractId: contractId,
						structureType: structureType,
						structure: structure,
						component: component
					}
				})
				.then(response => {
					console.log('Element API response:', response.data);
					const options = response.data.map(element => ({
						value: element,
						label: element
					}));
					setElementOptions(options);
				})
				.catch(error => {
					console.error('Error fetching element options:', error);
					setElementOptions([]);
				});
		} else {
			setElementOptions([]);
		}
	}, [formState.structureType, formState.structure, formState.component]);




	const [activityOptions, setActivityOptions] = useState([]);
	useEffect(() => {
		const { structureType, structure, component, element } = formState;

		if (structureType && structure && component) {
			axios
				.get(`${API_BASE_URL}rfi/activityNames`, {
					params: {
						structureType,
						structure,
						component,
						component_id: element // ✅ using `element` as `component_id`
					}
				})
				.then(response => {
					console.log('Activity API response:', response.data);
					const options = response.data.map(activity => ({
						value: activity,
						label: activity
					}));
					setActivityOptions(options);
				})
				.catch(error => {
					console.error('Error fetching activity options:', error);
					setActivityOptions([]);
				});
		} else {
			setActivityOptions([]);
		}
	}, [formState.structureType, formState.structure, formState.component, formState.element]);

	const [rfiDescriptionOptions, setRfiDescriptionOptions] = useState([]);
	const [addRfiEnclosuresOptions, setAddRfiEnclosuresOptions] = useState([]);

	useEffect(() => {
		if (formState.activity) {
			axios
				.get(`${API_BASE_URL}rfi/rfi-descriptions`, {
					params: { activity: formState.activity }
				})
				.then(response => {
					console.log("RFI Description API Response:", response.data);

					// Map RFI Descriptions
					const rfiOptions = response.data.map(item => ({
						value: item.rfiDescription,
						label: item.rfiDescription
					}));
					setRfiDescriptionOptions(rfiOptions);

					// ✅ Map Enclosures (flatten all arrays)
					const enclosureOptions = response.data.flatMap(item =>
						item.enclosures.map(enc => ({
							value: enc,
							label: enc
						}))
					);

					// ✅ Remove duplicates if needed
					const uniqueEnclosures = Array.from(
						new Map(enclosureOptions.map(e => [e.value, e])).values()
					);

					setAddRfiEnclosuresOptions(uniqueEnclosures);
				})
				.catch(error => {
					console.error("Error fetching RFI descriptions:", error);
					setRfiDescriptionOptions([]);
					setAddRfiEnclosuresOptions([]);
				});
		}
	}, [formState.activity]);






	const [nameOfRepresentativeOptions, setNameOfRepresentativeOptions] = useState([]);
	useEffect(() => {
		const fetchContractors = async () => {
			try {
				const response = await axios.get(`${API_BASE_URL}rfi/regularUsers`, {
					withCredentials: true,
				});
				const options = response.data.map((name) => ({
					value: name,
					label: name,
				}));

				options.sort((a, b) => a.label.localeCompare(b.label));

				setNameOfRepresentativeOptions(options);
			} catch (error) {
				console.error("Error fetching contractors:", error);
			}
		};

		fetchContractors();
	}, []);


	const typeOfRfiOptions = [
		{ value: 'Regular RFI', label: 'Regular RFI' },
		{ value: 'SPOT RFI', label: 'SPOT RFI' },
	];



	const validateStep1 = () => {
		const newErrors = {};

		if (!formState.project) newErrors.project = "Project is required";
		if (!formState.work) newErrors.work = "Work is required";
		if (!formState.contract) newErrors.contract = "Contract is required";
		if (!formState.structureType) newErrors.structureType = "Structure type is required";
		if (!formState.structure) newErrors.structure = "Structure is required";
		if (!formState.component) newErrors.component = "Component is required";
		if (!formState.element) newErrors.element = "Element is required";
		if (!formState.activity) newErrors.activity = "Activity is required";
		if (!formState.rfiDescription) newErrors.rfiDescription = "RFI description is required";

		setErrors(newErrors);

		return Object.keys(newErrors).length === 0; // ✅ true if no errors
	};

	const handleNext = () => {
		if (validateStep1()) {
			setStep(2);
		} else {
			alert("Please fill all required fields before proceeding.");
		}
	};

	const validateStep2 = () => {
		  const newErrors = {};

		  // action is required in edit mode
		  if (mode === "edit" && (!formState.action || formState.action.trim() === "")) {
		    newErrors.action = "Action is required";
		  }

		  // Common required fields
		  if (!formState.dateOfSubmission) newErrors.dateOfSubmission = "Date of submission is required";

		  // Only check representative/date/time if action demands it
		  if (formState.action?.toLowerCase() === "reschedule") {
		    if (!formState.dateOfInspection) newErrors.dateOfInspection = "Date of inspection is required";
		    if (!formState.timeOfInspection) newErrors.timeOfInspection = "Time of inspection is required";
		    if (!formState.nameOfRepresentative) newErrors.nameOfRepresentative = "Representative is required";
		  }

		  if (formState.action?.toLowerCase() === "reassign") {
		    if (!formState.nameOfRepresentative) newErrors.nameOfRepresentative = "Representative is required";
		  }

		  setErrors(newErrors);
		  return Object.keys(newErrors).length === 0;
		};

		const handleStep2Next = () => {
		  console.log("👉 initialData:", initialData);
		  console.log("👉 formState:", formState);

		  if (!validateStep2()) {
		    alert("Please make sure all mandatory fields are filled in.");
		    return;
		  }

		  if (mode?.toLowerCase() === "edit") {
		    const action = (formState.action || "").toLowerCase();

		    // Ensure initialData is ready
		    if ((action === "reschedule" || action === "reassign") && !initialData) {
		      alert("Original values not loaded yet. Please wait a moment and try again.");
		      return;
		    }

		    if (action === "reschedule") {
		      const originalDate = (initialData?.dateOfInspection || "").trim();
		      const originalTime = (initialData?.timeOfInspection || "").trim();

		      const currentDate = (formState.dateOfInspection || "").trim();
		      const currentTime = (formState.timeOfInspection || "").trim();

		      const dateChanged = currentDate && currentDate !== originalDate;
		      const timeChanged = currentTime && currentTime !== originalTime;

		      if (!dateChanged && !timeChanged) {
		        alert("Rescheduling requires changing the Date of Inspection, Time of Inspection, or both.");
		        return;
		      }
		    }

		    if (action === "reassign") {
		      const originalRep = (initialData?.nameOfRepresentative || "").trim();
		      const currentRep = (formState.nameOfRepresentative || "").trim();

		      if (currentRep === "" || currentRep === originalRep) {
		        alert("Please change the Assigned Representative before proceeding.");
		        return;
		      }
		    }
		  }

		  // ✅ Passed all checks
		  setStep(3);
		};
		
		
		const validateStep3 = () => {
		  const action = (formState.action || "").toLowerCase();
		  const newErrors = {};

		  if (mode?.toLowerCase() === "edit" && action === "update") {
		    // Compare old vs new enclosures
		    const originalEnclosures = Array.isArray(initialData.enclosuresList)
		      ? initialData.enclosuresList
		      : [];
		    const currentEnclosures = Array.isArray(formState.enclosures)
		      ? formState.enclosures
		      : [];

		    const originalStr = originalEnclosures.slice().sort().join(",");
		    const currentStr = currentEnclosures.slice().sort().join(",");

		    if (originalStr === currentStr) {
		      newErrors.enclosures = "Please update the Enclosures before submitting.";
		    }
		  } else if (mode?.toLowerCase() !== "edit") {
		    // Create mode → must select at least one
		    if (!formState.enclosures || formState.enclosures.length === 0) {
		      newErrors.enclosures = "Please select at least one enclosure.";
		    }
		  }

		  if (Object.keys(newErrors).length > 0) {
		    alert(Object.values(newErrors).join("\n"));
		    return false;
		  }

		  return true;
		};

		const handleStep3Submit = () => {
		  if (validateStep3()) {
		    handleSubmit();
		  }
		};


	return (
		<div className="dashboard create-rfi">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main no-overflow">
					<h2 className="text-xl font-bold mb-4 page-heading">
						{mode === 'edit' ? 'Edit RFI Details' : 'Add RFI Details'}
					</h2>

					{message && (
						<div className={`mb-4 p-2 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
							{message}
						</div>
					)}

					{step === 1 && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
							<fieldset disabled={!isEditable}>
								<div className="form-row flex-wrap">
									<div className="form-fields flex-2">
										<label htmlFor="project" className="block mb-1">Project <span class="red">*</span>:</label>
										<Select
											id="project"
											name="project"
											options={projectOptions}
											value={formState.project ? { value: formState.project, label: formState.project } : null}
											onChange={(selected) => {

												const selectedProjectName = selected?.value || '';
												const selectedProjectId = projectIdMap[selectedProjectName] || '';

												setFormState({
													...formState,
													project: selectedProjectName,
													projectId: selectedProjectId,
													work: '',
													contract: '',
													structureType: '',
													structure: '',
													component: '',
													element: '',
													activity: ''
												});

												if (selectedProjectId) {
													axios.get(`${API_BASE_URL}rfi/workNames`, {
														params: { projectId: selectedProjectId }
													})
														.then(response => {
															const map = {};
															const workOptions = response.data.map(work => {
																map[work.workName] = work.workId;
																return {
																	value: work.workName,
																	label: work.workName
																};
															});
															setWorkOptions(workOptions);
															setWorkIdMap(map);
														})
														.catch(error => {
															console.error('Error fetching work options:', error);
															setWorkOptions([]);
														});
												} else {
													setWorkOptions([]);
												}
											}}
											isDisabled={!isEditable}
										/>
									</div>


									<div className="form-fields flex-2">
										<label htmlFor="work" className="block mb-1">Work <span class="red">*</span>:</label>
										<Select
											id="work"
											name="work"
											options={workOptions}
											value={formState.work ? workOptions.find(w => w.value === formState.work) : null}
											onChange={(selected) => {
												const selectedWorkName = selected?.value || '';
												const selectedWorkId = workIdMap[selectedWorkName] || '';

												setFormState({
													...formState,
													work: selectedWorkName,
													contract: '',
													structureType: '',
													structure: '',
													component: '',
													element: '',
													activity: ''
												});

												if (!selectedWorkId || allowedContractNames.size === 0) {
													console.warn('Work ID or allowed contracts not loaded yet.');
													setContractOptions([]);
													setContractIdMap({});
													return;
												}

												axios.get(`${API_BASE_URL}rfi/contractNames`, {
													params: { workId: selectedWorkId }
												})
													.then(response => {
														const map = {};
														const contractOptions = response.data
															.filter(contract => allowedContractNames.has(contract.contractShortName))
															.map(contract => {
																const name = contract.contractShortName;
																const id = contract.contractIdFk.trim();
																const dyHodUserId = contract.dyHodUserId.trim();
																map[name] = id;
																return {
																	value: name,
																	label: name,
																	dyHodUserId: dyHodUserId
																};
															});

														setContractOptions(contractOptions);
														setContractIdMap(map);
													})
													.catch(error => {
														console.error('Error fetching contract options:', error);
														setContractOptions([]);
														setContractIdMap({});
													});
											}

											}
											isDisabled={!isEditable}
										/>
									</div>



									<div className="form-fields flex-1">
										<label htmlFor="contract" className="block mb-1">Contract <span class="red">*</span>:</label>
										<Select
											id="contract"
											name="contract"
											options={contractOptions}
											value={formState.contract ? contractOptions.find(c => c.value === formState.contract) : null}
											onChange={(selected) => {
												const selectedContractName = selected?.value || '';
												const selectedContractId = contractIdMap[selectedContractName] || '';
												const selectedDyHodUserId = selected?.dyHodUserId || '';

												setFormState({
													...formState,
													contract: selectedContractName,
													contractId: selectedContractId,
													dyHodUserId: selectedDyHodUserId,
													structureType: '',
													structure: '',
													component: '',
													element: '',
													activity: ''
												});

												if (selectedContractId) {
													axios.get(`${API_BASE_URL}rfi/structureType`, {
														params: { contractId: selectedContractId }
													})
														.then(response => {
															const options = response.data.map(type => ({
																value: type,
																label: type
															}));
															setStructureTypeOptions(options);
														})
														.catch(error => {
															console.error('Error fetching structure types:', error);
															setStructureTypeOptions([]);
														});
												} else {
													setStructureTypeOptions([]);
												}
											}}
											isDisabled={!isEditable}
										/>
									</div>

									<div className="form-fields flex-4">
										<label htmlFor="structureType" className="block mb-1">Structure Type <span class="red">*</span>:</label>
										<Select
											id="structureType"
											name="structureType"
											options={structureTypeOptions}
											value={
												formState.structureType
													? structureTypeOptions.find(s => s.value === formState.structureType)
													: null
											}
											onChange={(selected) =>
												setFormState({
													...formState,
													structureType: selected?.value || '',
													structure: '',
													component: '',
													element: '',
													activity: ''
												})
											}
											isDisabled={!isEditable}
										/>
									</div>

									<div className="form-fields flex-4">
										<label htmlFor="structure" className="block mb-1">Structure <span class="red">*</span>:</label>
										<Select
											id="structure"
											name="structure"
											options={structureOptions}
											placeholder="Select Structure..." // ✅ Shows 'Select Structure...' when structure is ''
											value={
												formState.structure
													? structureOptions.find(s => s.value === formState.structure)
													: null
											}
											onChange={(selected) =>
												setFormState({
													...formState,
													structure: selected?.value || '',
													component: '',
													element: '',
													activity: ''
												})
											}
											isDisabled={!isEditable}
										/>
									</div>



									<div className="form-fields flex-4">
										<label htmlFor="component" className="block mb-1">Component <span class="red">*</span>:</label>
										<Select
											id="component"
											name="component"
											options={componentOptions}
											placeholder="Select Component..."
											value={
												formState.component
													? componentOptions.find(c => c.value === formState.component)
													: null
											}
											onChange={(selected) =>
												setFormState({
													...formState,
													component: selected?.value || '',
													element: '',
													activity: ''
												})
											}
											isDisabled={!isEditable}
										/>
									</div>




									<div className="form-fields flex-4">
										<label htmlFor="element" className="block mb-1">Element <span class="red">*</span>:</label>
										<Select
											id="element"
											name="element"
											options={elementOptions}
											placeholder="Select Element..."
											value={
												formState.element
													? elementOptions.find(e => e.value === formState.element)
													: null
											}
											onChange={(selected) =>
												setFormState({
													...formState,
													element: selected?.value || '',
													activity: ''
												})
											}
											isDisabled={!isEditable}
										/>
									</div>


									<div className="form-row justify-start">
										<div className="form-fields flex-4">
											<label htmlFor="activity" className="block mb-1">Activity <span class="red">*</span>:</label>
											<Select
												id="activity"
												name="activity"
												options={activityOptions}
												placeholder="Select Activity..."
												value={
													formState.activity
														? activityOptions.find(a => a.value === formState.activity)
														: null
												}
												onChange={(selected) =>
													setFormState({ ...formState, activity: selected?.value || '' })
												}
												isDisabled={!isEditable}
											/>
										</div>

										<div className="form-fields flex-4">
											<label htmlFor="rfiDescription" className="block mb-1">RFI Description <span class="red">*</span>:</label>
											<Select
												id="rfiDescription"
												name="rfiDescription"
												options={rfiDescriptionOptions}
												value={
													formState.rfiDescription
														? { value: formState.rfiDescription, label: formState.rfiDescription }
														: null
												}
												onChange={(selected) =>
													setFormState({ ...formState, rfiDescription: selected?.value || '' })
												}
												isDisabled={!isEditable}
											/>
										</div>
									</div>

								</div>
							</fieldset>
							<div className="d-flex justify-end">
								<button onClick={handleNext} className="btn btn-primary">
									Next
								</button>
							</div>

						</motion.div>
					)}

					{step === 2 && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
							<div className="form-row flex-wrap align-center">
								<div className="form-fields flex-1">
									<label htmlFor="action" className="block mb-1">Action <span class="red">*</span>:</label>
									{errors.reschedule && (
										<p style={{ color: "red", fontSize: "12px" }}>{errors.reschedule}</p>
									)}
									{mode === 'edit' ? (
										<select
											id="action"
											name="action"
											value={formState.action}
											onChange={handleChange}
											isDisabled={getDisabledStatus(2, "action")}
											className="form-control"
										>
											<option value="">-- Select Action --</option>
											{actions.map((action) => (
												<option key={action} value={action}>
													{action}
												</option>
											))}
										</select>
									) : (
										<input
											type="text"
											id="action"
											name="action"
											value="Action"
											disabled
											className="form-control"
											style={{ color: '#aaa', backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
										/>
									)}
								</div>


								<div className="form-fields flex-1">
									<label htmlFor="typeOfRFI" className="block mb-1">Type of RFI:</label>
									<Select
										id="typeOfRFI"
										name="typeOfRFI"
										options={typeOfRfiOptions}
										value={formState.typeOfRFI ? { value: formState.typeOfRFI, label: formState.typeOfRFI } : null}
										onChange={(selected) => setFormState({ ...formState, typeOfRFI: selected?.value || '' })}
										isDisabled={getDisabledStatus(2, "typeOfRfi")}
									/>
								</div>

								<div className="form-fields flex-1">
									<label htmlFor="nameOfRepresentative" className="block mb-1">
										Name of Contractor's Representative  <span class="red">*</span>:
									</label>
									<Select
										id="nameOfRepresentative"
										name="nameOfRepresentative"
										options={nameOfRepresentativeOptions}
										value={
											formState.nameOfRepresentative
												? {
													value: formState.nameOfRepresentative,
													label: formState.nameOfRepresentative,
												}
												: null
										}
										onChange={(selected) =>
											setFormState({
												...formState,
												nameOfRepresentative: selected?.value || "",
											})
										}
										placeholder="Select Representative..."
										isClearable
										isDisabled={getDisabledStatus(2, "nameOfRepresentative")} 
									/>

								</div>
								<div className="form-fields flex-1">
									<label htmlFor="dateOfSubmission" className="block mb-1">Date of Submission of RFI <span class="red">*</span>:</label>
									<input
										type="date"
										id="dateOfSubmission"
										name="dateOfSubmission"
										value={formState.dateOfSubmission}
										onChange={handleChange}
										disabled={getDisabledStatus(2, "dateOfSubmission")}
										min={getTodayISO()}
										readOnly
									/>
								</div>

								<div className="form-fields flex-1">
									<label htmlFor="timeOfInspection" className="block mb-1">Time Of Inspection  <span class="red">*</span>:</label>
									<input
										type="time"
										id="timeOfInspection"
										name="timeOfInspection"
										value={formState.timeOfInspection}
										onChange={handleChange}
										disabled={getDisabledStatus(2, "timeOfInspection")}
										placeholder="Enter value"
										style={{
											borderColor: errors.reschedule ? "red" : "#ccc"
										}}

									/>
								</div>
								<div className="form-fields flex-1">
									<label htmlFor="dateOfInspection" className="block mb-1">Date of Inspection <span class="red">*</span>:</label>
									<input
										type="date"
										id="dateOfInspection"
										name="dateOfInspection"
										value={formState.dateOfInspection}
										onChange={handleChange}
										disabled={getDisabledStatus(2, "dateOfInspection")}
										min={getMinInspectionDate()}
										style={{
											borderColor: errors.reschedule ? "red" : "#ccc"
										}}
									/>
								</div>


							</div>

							<div className="d-flex justify-end gap-20">
								<button onClick={() => setStep(1)} className="btn btn-white">Back</button>
								<button 
									type="button"
									  onClick={handleStep2Next}
									  className="btn btn-primary"
									>
									  Next
									</button>
							</div>

						</motion.div>
					)}

					{step === 3 && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
							<div className="form-row flex-wrap align-center">
								<div className="form-fields flex-1">
									<label htmlFor="enclosures" className="block mb-1">Enclosures <span class="red">*</span>:</label>
									<Select
										id="enclosures"
										name="enclosures"
										options={addRfiEnclosuresOptions}
										isMulti
										value={addRfiEnclosuresOptions.filter(option =>
											formState.enclosures.includes(option.value)
										)}
										onChange={(selectedOptions) =>
											setFormState({
												...formState,
												enclosures: selectedOptions.map(opt => opt.value) || [] // ✅ Store only string values
											})
										}
										isDisabled={getDisabledStatus(3, "enclosures")}
									/>





								</div>

								{/*		<div className="form-group mb-3">
									<label className="block mb-1 font-semibold">Measurements</label>
									<div className="flex gap-3">
										{ Dropdown for measurement type }
										<select
											name="measurementType"
											value={formState.measurementType}
											onChange={handleChange}
											className="form-control w-40"
										>
											<option value="">Select Type</option>
											<option value="Length">Length</option>
											<option value="Volume">Volume</option>
											<option value="Area">Area</option>
											<option value="Number">Number</option>
										</select>

										{ Input for measurement value }
										<input
											type="text"
											name="measurementValue"
											value={formState.measurementValue}
											onChange={handleChange}
											className="form-control w-40"
											placeholder="Enter value"
										/>
									</div>
								</div>*/}


								{	/*	<div className="form-fields flex-1">
									<label htmlFor="location" className="block mb-1">Location:</label>
									<input
										type="text"
										id="location"
										name="location"
										value={formState.location}
										onChange={handleChange}
										placeholder="Enter value"
									/>
								</div>*/}

								<div className="form-fields flex-1">
									<label htmlFor="description" className="block mb-1">Description:</label>
									<textarea
										id="description"
										name="description"
										value={formState.description}
										onChange={handleChange}
										disabled={getDisabledStatus(3, "description")}
										className="w-full p-2 border rounded"
										rows={4}
										placeholder="Enter Description"
									/>
								</div>
							</div>
							<div className="d-flex justify-end">
								<button onClick={() => setStep(2)} className="btn btn-white">
									Back
								</button>
								<button
								  onClick={handleStep3Submit}
								  className="btn btn-primary"
								>
								  {mode === 'edit' ? 'Update' : 'Submit'}
								</button>


							</div>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CreateRfi;
