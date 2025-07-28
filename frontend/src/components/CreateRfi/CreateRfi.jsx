import React, { useState, useEffect } from 'react';
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

	const [isEditable, setIsEditable] = useState(mode?.toLowerCase() !== 'edit');
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;



	useEffect(() => {
		setIsEditable(mode?.toLowerCase() !== 'edit');
	}, [mode]);

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
		dateOfSubmission: '',
		dateOfInspection: '',
		enclosures: '',
		location: '',
		description: '',
		dyHodUserId: '',
	});
	const [message, setMessage] = useState('');

	useEffect(() => {
		if (mode === 'edit' && formData) {
			setFormState({
				project: formData.project || '',
				work: formData.work || '',
				contract: formData.contract || '',
				structureType: formData.structureType || '',
				structure: formData.structure || '',
				component: formData.component || '',
				element: formData.element || '',
				activity: formData.activity || '',
				rfiDescription: formData.rfiDescription || '',
				action: formData.action || '',
				typeOfRFI: formData.typeOfRFI || '',
				nameOfRepresentative: formData.nameOfRepresentative || '',
				timeOfInspection: formData.timeOfInspection || '',
				rfi_Id: formData.rfi_Id || '',
				dateOfSubmission: formData.dateOfSubmission || '',
				dateOfInspection: formData.dateOfInspection || '',
				enclosures: formData.enclosures || '',
				location: formData.location || '',
				description: formData.description || '',
			});
		}
	}, [mode, formData]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "dateOfSubmission") {
    const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
    if (value < today) {
      alert("Date of Submission should not be prior to today's date.");
      return; // stop further execution
    }
  }
		setFormState({ ...formState, [name]: value });
	};

	const handleSubmit = async () => {

		setMessage('');
		const url =
			mode === 'edit'
				? `${API_BASE_URL}rfi/update/${location.state.id}`
				: `${API_BASE_URL}rfi/create`;
		const method = mode === 'edit' ? 'PUT' : 'POST';


		try {
			const response = await fetch(url, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(formState),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Error: ${response.status} - ${errorText}`);
			}

			const message = await response.text();
			setMessage(message);
			alert(message);
			navigate('/Dashboard');
		} catch (error) {
			console.error('Error submitting RFI:', error);
			setMessage('❌ Failed to submit RFI. Please try again.');
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


	const rfiDescriptionOptions = [
		{ value: 'Start of Pile Boring Work', label: 'Start of Pile Boring Work' },
		{ value: 'Pile Depth Checking', label: 'Pile Depth Checking' },
		{ value: 'Reinforcement Cage Checking', label: 'Reinforcement Cage Checking' },
		{ value: 'Steel Cage lowering & approval of concreting for Concreting', label: 'Steel Cage lowering & approval of concreting for Concreting' },
	];
	const typeOfRfiOptions = [
		{ value: 'typeOfRFI 1', label: 'typeOfRFI 1' },
		{ value: 'typeOfRFI 2', label: 'typeOfRFI 2' },
	];
	const nameOfRepresentativeOptions = [
		{ value: 'nameOfRepresentative 1', label: 'nameOfRepresentative 1' },
		{ value: 'nameOfRepresentative 2', label: 'nameOfRepresentative 2' },
	];
	const addRfiEnclosuresOptions = [
		{ value: 'addRfiEnclosures 1', label: 'addRfiEnclosures 1' },
		{ value: 'addRfiEnclosures 2', label: 'addRfiEnclosures 2' },
	];
	return (
		<div className="dashboard create-rfi">
			<HeaderRight />
			<div className="right">
				<div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-md">
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
										<label htmlFor="project" className="block mb-1">Project:</label>
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
										<label htmlFor="work" className="block mb-1">Work:</label>
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
																	dyHodUserId:dyHodUserId
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
										<label htmlFor="contract" className="block mb-1">Contract:</label>
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
										<label htmlFor="structureType" className="block mb-1">Structure Type:</label>
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
										<label htmlFor="structure" className="block mb-1">Structure:</label>
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
										<label htmlFor="component" className="block mb-1">Component:</label>
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
										<label htmlFor="element" className="block mb-1">Element:</label>
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
											<label htmlFor="activity" className="block mb-1">Activity:</label>
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
											<label htmlFor="rfiDescription" className="block mb-1">RFI Description:</label>
											<Select
												id="rfiDescription"
												name="rfiDescription"
												options={rfiDescriptionOptions}
												value={formState.rfiDescription ? { value: formState.rfiDescription, label: formState.rfiDescription } : null}
												onChange={(selected) => setFormState({ ...formState, rfiDescription: selected?.value || '' })}
												isDisabled={!isEditable}
											/>
										</div>
									</div>

								</div>
							</fieldset>
							<div className="d-flex justify-end">
								<button onClick={() => setStep(2)} className="btn btn-primary">
									Next
								</button>
							</div>
						</motion.div>
					)}

					{step === 2 && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
							<div className="form-row flex-wrap align-center">
								<div className="form-fields flex-1">
									<label htmlFor="action" className="block mb-1">Action:</label>
									{mode === 'edit' ? (
										<select
											id="action"
											name="action"
											value={formState.action}
											onChange={handleChange}
											className="form-control"
										>
											<option value="">-- Select Action --</option>
											<option value="Reschedule">Reschedule</option>
											<option value="Update">Update</option>
											<option value="Reassign">Reassign</option>
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
									/>
								</div>

								<div className="form-fields flex-1">
									<label htmlFor="nameOfRepresentative" className="block mb-1">Name Of Representative:</label>
									<Select
										id="nameOfRepresentative"
										name="nameOfRepresentative"
										options={nameOfRepresentativeOptions}
										value={formState.nameOfRepresentative ? { value: formState.nameOfRepresentative, label: formState.nameOfRepresentative } : null}
										onChange={(selected) => setFormState({ ...formState, nameOfRepresentative: selected?.value || '' })}
									/>
								</div>

								<div className="form-fields flex-1">
									<label htmlFor="timeOfInspection" className="block mb-1">Time Of Inspection:</label>
									<input
										type="time"
										id="timeOfInspection"
										name="timeOfInspection"
										value={formState.timeOfInspection}
										onChange={handleChange}
										placeholder="Enter value"
									/>
								</div>

								<div className="form-fields flex-1">
									<input
										type="hidden"
										id="rfi_Id"
										name="rfi_Id"
										value={formState.rfi_Id}
										onChange={handleChange}
										placeholder="Enter value"


									/>
								</div>
						<div className="form-fields flex-1">
  <label htmlFor="dateOfSubmission" className="block mb-1">Date of Submission of RFI:</label>
  <input
    type="date"
    id="dateOfSubmission"
    name="dateOfSubmission"
    value={formState.dateOfSubmission}
    onChange={handleChange}
    min={new Date().toISOString().split('T')[0]} // 👈 sets min to today's date
  />
</div>


								<div className="form-fields flex-1">
									<label htmlFor="dateOfInspection" className="block mb-1">Date of Inspection:</label>
									<input
										type="date"
										id="dateOfInspection"
										name="dateOfInspection"
										value={formState.dateOfInspection}
										onChange={handleChange}
									/>
								</div>


							</div>

							<div className="d-flex justify-end gap-20">
								<button onClick={() => setStep(1)} className="btn btn-white">
									Back
								</button>
								<button onClick={() => setStep(3)} className="btn btn-primary">
									Next
								</button>
							</div>
						</motion.div>
					)}

					{step === 3 && (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
							<div className="form-row flex-wrap align-center">
								<div className="form-fields flex-1">
									<label htmlFor="enclosures" className="block mb-1">Enclosures:</label>
									<Select
										id="enclosures"
										name="enclosures"
										options={addRfiEnclosuresOptions}
										value={formState.enclosures ? { value: formState.enclosures, label: formState.enclosures } : null}
										onChange={(selected) => setFormState({ ...formState, enclosures: selected?.value || '' })}
									/>
								</div>
								<div className="form-fields flex-1">
									<label htmlFor="location" className="block mb-1">Location:</label>
									<input
										type="text"
										id="location"
										name="location"
										value={formState.location}
										onChange={handleChange}
										placeholder="Enter value"
									/>
								</div>

								<div className="form-fields flex-1">
									<label htmlFor="description" className="block mb-1">Description:</label>
									<textarea
										id="description"
										name="description"
										value={formState.description}
										onChange={handleChange}
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
								<button onClick={handleSubmit} className="btn btn-primary">
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
