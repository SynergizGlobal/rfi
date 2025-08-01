import React, { useEffect, useState,useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import CameraCapture from '../CameraCapture/CameraCapture';
import './InspectionForm.css';

const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();

const initialChecklist = [
	{ id: 1, description: 'Drawing Approved and available', status: '', contractorRemark: '', aeRemark: '' },
	{ id: 2, description: 'Shuttering aligned and dimensionally correct', status: '', contractorRemark: '', aeRemark: '' },
];

const enclosuresData = [
	{ id: 1, rfiDescription: 'PCC', enclosure: 'Level Sheet' },
	{ id: 2, rfiDescription: 'PCC', enclosure: 'Pour Card' },
];

export default function InspectionForm() {
	const location = useLocation();
	const id = location.state?.rfi;
	const skipSelfie = location.state?.skipSelfie;
	const [step, setStep] = useState(skipSelfie ? 2 : 1);
	const [rfiData, setRfiData] = useState(null);
	const [locationText, setLocationText] = useState('');
	const [contractorRep, setContractorRep] = useState('');
	const [confirmPopup, setConfirmPopup] = useState(false);
	const [selfieImage, setSelfieImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([null, null, null, null]);

	const [enclosureStates, setEnclosureStates] = useState({});
	const [checklistPopup, setChecklistPopup] = useState(null);
	const [uploadPopup, setUploadPopup] = useState(null);
	const [showCamera, setShowCamera] = useState(false);
	const [cameraMode, setCameraMode] = useState('environment');
	const [gradeOfConcrete, setGradeOfConcrete] = useState('');
	const [chainage, setChainage] = useState('');
	const [inspectionStatus, setInspectionStatus] = useState('');
	const [testInLab, setTestInLab] = useState(null);
	const [inspectionId, setInspectionId] = useState(null);
	const [testReportFile, setTestReportFile] = useState(null);
	const [dateOfInspection, setDateOfInspection] = useState('');
	const [timeOfInspection, setTimeOfInspection] = useState('');
	

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	const selfieRef = useRef(null);
	const firstGalleryRef = useRef(null);


	useEffect(() => {
		if (id) {
			fetch(`${API_BASE_URL}rfi/rfi-details/${id}`, { credentials: 'include' })

				.then(res => res.json())
				.then(data => {
					setRfiData(data);
					setContractorRep(data.nameOfRepresentative || '');
					if (Array.isArray(data.inspectionDetails) && data.inspectionDetails.length > 0) {
						const latestInspection = data.inspectionDetails.reduce((latest, current) =>
							current.id > latest.id ? current : latest
						);

						setInspectionId(latestInspection.id);
					}
					else {
						// ✅ Try restoring from localStorage
						const savedId = localStorage.getItem("latestInspectionId");
						if (savedId) {
							setInspectionId(parseInt(savedId));
						}
					}
				})
				.catch(err => console.error("Error fetching RFI details:", err));
		}
	}, [id]);
	useEffect(() => {
			const now = new Date();

			// Format YYYY-MM-DD
			const date = now.toISOString().split("T")[0];

			// Format HH:MM (24-hour)
			const time = now.toTimeString().split(" ")[0].slice(0, 5);

			setDateOfInspection(date);
			setTimeOfInspection(time);
		}, []);


	const fetchLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async position => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					try {
						const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
						const data = await res.json();
						setLocationText(data.display_name || `Lat: ${lat}, Lng: ${lng}`);
					} catch {
						setLocationText(`Lat: ${lat}, Lng: ${lng}`);
					}
				},
				() => setLocationText('Location access denied')
			);
		}
	};

	function dataURLtoFile(dataUrl, filename) {
		const arr = dataUrl.split(',');
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}

	const handleChecklistSubmit = async (id, data, contractorSign, gcSign, grade) => {
		const enclosure = enclosuresData.find(e => e.id === id)?.enclosure || '';
		const dto = {
			rfiId: rfiData.id,
			enclosureName: enclosure,
			gradeOfConcrete: grade,
			drawingApproved: data[0].status,
			drawingRemarkContractor: data[0].contractorRemark,
			drawingRemarkAE: data[0].aeRemark,
			alignmentOk: data[1].status,
			alignmentRemarkContractor: data[1].contractorRemark,
			alignmentRemarkAE: data[1].aeRemark,
		};

		const formData = new FormData();
		formData.append("data", JSON.stringify(dto));
		if (contractorSign) formData.append("contractorSignature", contractorSign);
		if (gcSign) formData.append("clientSignature", gcSign);

		try {
			const res = await fetch(`${API_BASE_URL}rfi/save`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});
			const text = await res.text();
			if (!res.ok) {
				alert(`Checklist save failed: ${res.status} - ${text}`);
				return;
			}

			// ✅ SET checklistDone and checklist data
			setEnclosureStates(prev => ({
				...prev,
				[id]: {
					checklist: data,
					contractorSign,
					gcSign,
					gradeOfConcrete: grade,
					checklistDone: true,
				}
			}));
			setChecklistPopup(null);

		} catch (err) {
			console.error("Checklist save failed:", err);
			alert("Checklist save failed: " + err.message);
		}
	};

	const handleSubmitConfirmed = async () => {
		const formData = new FormData();
		const id = inspectionId ?? parseInt(localStorage.getItem("latestInspectionId"));
		const payload = {
			inspectionId: id,
			rfiId: rfiData.id,
			inspectionStatus,
			testInsiteLab: testInLab,

		};
		console.log("RFI ID" , rfiData.id);
		formData.append("data", JSON.stringify(payload));
		if (testReportFile) {
			formData.append("testReport", testReportFile);
		}

		try {
			const res = await fetch(`${API_BASE_URL}rfi/inspection/status`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await res.text();
			// Debug response info
			console.log("Response status:", res.status);
			console.log("Response text:", text);


			if (!res.ok) {
				alert(`❌ Failed to submit inspection status`);

				return;
			}

			alert("Inspection Status submitted successfully.");
			setConfirmPopup(false);
			localStorage.removeItem("latestInspectionId");
			window.location.href = `${window.location.origin}/rfiSystem/Inspection`;

		} catch (err) {
			console.error("Submit failed:", err);
			alert("Error: " + err.message);
		}
	};


	const handleUploadSubmit = async (id, file) => {
		const enclosure = enclosuresData.find(e => e.id === id)?.enclosure || '';
		const formData = new FormData();

		formData.append('rfiId', rfiData.id);
		formData.append('file', file);
		formData.append('enclosureName', enclosure);

		try {
			const res = await fetch(`${API_BASE_URL}rfi/upload`, {
				method: 'POST',
				body: formData,
				credentials: "include",
			});
			const text = await res.text();
			if (!res.ok) {
				console.error("Upload failed:", text);
				alert(`Upload failed: ${text}`);
				return;
			}
			setEnclosureStates(prev => ({ ...prev, [id]: { ...prev[id], uploadedFile: file } }));
			setUploadPopup(null);
		} catch (err) {
			console.error("Upload failed:", err);
			alert("Checklist save failed: " + err.message);

		}
	};

	const handleSaveInspection = async () => {
		
		if (!selfieImage) {
			      alert('❌ Selfie image is required.');
			      selfieRef.current?.focus();
			      return;
			    }
				const hasGallery = Object.values(galleryImages).some((img) => img);
				   if (!hasGallery) {
				     alert('❌ At least one site image is required.');
				     firstGalleryRef.current?.focus();
				     return;
				   }
		const formData = new FormData();
		const inspectionPayload = {
			rfiId: rfiData.id,
			location: locationText,
			chainage: chainage,
			nameOfRepresentative: contractorRep

		};

		formData.append('data', JSON.stringify(inspectionPayload));

		if (selfieImage) {
			if (selfieImage instanceof File) {
				formData.append('selfie', selfieImage);
			} else if (typeof selfieImage === 'string' && selfieImage.startsWith('data:image/')) {
				const selfieFile = dataURLtoFile(selfieImage, 'selfie.jpg');
				formData.append('selfie', selfieFile);
			}
		}


		galleryImages.forEach((img, index) => {
			if (img instanceof File) {
				formData.append('siteImages', img);
			} else if (typeof img === 'string' && img.startsWith('data:image/')) {
				const converted = dataURLtoFile(img, `siteImage${index + 1}.jpg`);
				formData.append('siteImages', converted);
			}
		});

		try {
			const res = await fetch(`${API_BASE_URL}rfi/start`, {
				method: 'POST',
				body: formData,
				credentials: "include",
			});
			const idText = await res.text();
			const id = parseInt(idText);
			setInspectionId(id);
			localStorage.setItem("latestInspectionId", id);

			alert("Inspection saved successfully. ID: " + id);

		} catch (err) {
			console.error("Inspection save failed:", err);
			alert(`❌ Inspection save failed: ${err.message}`);
		}
			
	};

	const fetchChecklistData = async (rfiId, enclosureName) => {
	  try {
	    const res = await fetch(
	      `${API_BASE_URL}rfi/getChecklist?rfiId=${rfiId}&enclosureName=${encodeURIComponent(enclosureName)}`,
	      { credentials: 'include' }
	    );
		if (!res.ok) throw new Error(`Checklist fetch failed: ${res.status}`);

		    const flat = await res.json();

		    const checklist = [
		      {
		        id: 1,
		        description: "Drawing Approved and available",
		        status: flat.drawingApproved,
		        contractorRemark: flat.drawingRemarkContractor,
		        aeRemark: flat.drawingRemarkAE,
		      },
		      {
		        id: 2,
		        description: "Shuttering aligned and dimensionally correct",
		        status: flat.alignmentOk,
		        contractorRemark: flat.alignmentRemarkContractor,
		        aeRemark: flat.alignmentRemarkAE,
		      }
		    ];

		    return {
		      checklist,
		      gradeOfConcrete: flat.gradeOfConcrete || "",
		      contractorSign: flat.contractorSignature || null,
		      gcSign: flat.clientSignature || null,
		    };

		  } catch (error) {
		    console.error("Error fetching checklist:", error);
		    return null;
		  }
	};


	if (!rfiData) return <div>Loading RFI details...</div>;

	return (
		<div className="dashboard create-rfi inspection-form">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-inspection-form">

						{step === 1 && (
							<div className="form-step">
								<h2>RFI Inspection - Step 1</h2>
								<div className="form-grid">
									<div className="form-left">
										<label>RFI ID:</label><input type="text" readOnly value={rfiData.rfi_Id} />
										<label>Project:</label><input type="text" readOnly value={rfiData.project} />
										<label>Contract:</label><input type="text" readOnly value={rfiData.contract} />
										<label>Structure:</label><input type="text" readOnly value={rfiData.structure} />
										<label>Activity:</label><input type="text" readOnly value={rfiData.activity} />
										<label>RFI Description:</label><input type="text" readOnly value={rfiData.rfiDescription} />
										<label>Description:</label><input type="text" readOnly value={rfiData.description} />
										<label>Chainage:</label>
										<input type="text" value={chainage} onChange={e => setChainage(e.target.value)} />


									</div>
									<div className="upload-section">
										<label>Selfie:</label>
										{selfieImage ? (
											<img src={selfieImage} alt="Selfie" className="selfie-preview" />
										) : (
											<button onClick={() => { setCameraMode('user'); setShowCamera('selfie'); }}>📷 Capture Selfie</button>
										)}
										{!selfieImage && <p className="error">*Selfie required</p>}
									</div>
								</div>
								<button disabled={!selfieImage} onClick={() => setStep(2)} className="next-btn">Next</button>
							</div>
						)}

						{step === 2 && (
							<div className="form-step">
								<h2>RFI Inspection - Step 2</h2>
								<div className="form-grid">
									<div className="form-left">
										<label>Location:</label>
										<input value={locationText} onFocus={fetchLocation} onChange={e => setLocationText(e.target.value)} />
										<label>Date of Inspection:</label>
										<input type="date" value={dateOfInspection} onChange={e => setDateOfInspection(e.target.value)} />
										<label>Time of Inspection:</label>
										<input type="time" value={timeOfInspection} onChange={e => setTimeOfInspection(e.target.value)} />
										<label>Contractor's Representative:</label>
										<input type="text"  value={contractorRep} onChange={e => setContractorRep(e.target.value)} />
									</div>
									<div className="upload-grid">
										{[0, 1, 2, 3].map(i => (
											<div key={i} className="capture-option">
												<button onClick={() => { setCameraMode('environment'); setShowCamera(`gallery-${i}`); }}>
													📷 Capture Image {i + 1}
												</button>
												<input
													type="file"
													accept="image/*"
													onChange={e => {
														const file = e.target.files[0];
														if (file) {
															const updated = [...galleryImages];
															updated[i] = file;
															setGalleryImages(updated);
														}

													}}
												/>
												{galleryImages[i] && (
													<img src={galleryImages[i] instanceof File ? URL.createObjectURL(galleryImages[i]) : galleryImages[i]}
														alt={`Site ${i + 1}`}
														className="gallery-preview" />
												)}
				                         		</div>
								             		))}
							              		</div>
				                 				</div>


					                        		         	<h3>Enclosures</h3>
																<table className="enclosure-table">
																	<thead>
																		<tr><th>RFI Description</th><th>Enclosure</th><th>Action</th>
																			<th>Uploaded</th>
																			<th>Other</th></tr>
																	</thead>
																	<tbody>
																		{enclosuresData.map((e, index) => {
																			const state = enclosureStates[e.id] || {};
																			const rfiReportFilepath = rfiData.inspectionDetails?.[0]?.testSiteDocuments || '';
								 
																			// Find enclosure file for the current row based on name match
																			const enclosureFile = rfiData.enclosure?.find(enc =>
																				enc.enclosureName?.trim().toLowerCase() === e.enclosure?.trim().toLowerCase()
																			)?.enclosureUploadFile;
								 
																			return (
																				<tr key={e.id}>
																					<td>{e.rfiDescription}</td>
																					<td>{e.enclosure}</td>
								 
																					<td>
																						<button disabled={state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Open</button>{' '}
																						<button disabled={!state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Edit</button>
																						{deptFK?.toLowerCase() !== 'engg' && (
																							<button onClick={() => setUploadPopup(e.id)}>Upload</button>
																						)}
																					</td>
								 
								 
								 
																					<td>
																					{enclosureFile ? (
																					  <button
																					    onClick={() => {
																					      const link = document.createElement('a');
																					      link.href = `${API_BASE_URL.replace(/\/$/, '')}/rfi/DownloadPrev?filepath=${encodeURIComponent(enclosureFile)}`;
																					      link.download = enclosureFile.split(/[\\/]/).pop(); // Extract file name
																					      document.body.appendChild(link);
																					      link.click();
																					      document.body.removeChild(link);
																					    }}
																					    style={{ padding: '4px 10px', cursor: 'pointer' }}
																					  >
																					    Download Enclosure
																					  </button>
																					) : (
																					  '---'
																					)}
																					</td>
								 
																					{index === 0 && (
																						<td rowSpan={enclosuresData.length}>
																							{rfiReportFilepath && (
																								<button
																								  onClick={() => {
																								    const link = document.createElement('a');
																								    link.href = `${API_BASE_URL.replace(/\/$/, '')}/rfi/DownloadPrev?filepath=${encodeURIComponent(rfiReportFilepath)}`;
																								    link.download = rfiReportFilepath.split(/[\\/]/).pop(); // filename
																								    document.body.appendChild(link);
																								    link.click();
																								    document.body.removeChild(link);
																								  }}
																								>
																								  Download Test Report
																								</button>
								 
																							)}
																						</td>
																					)}
																				</tr>
																			);
																		})}
																	</tbody>
																</table>

								<div className="btn-row">
									<button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
									<button className="btn btn-blue" onClick={handleSaveInspection}>Save</button>
									<button className="btn btn-green" onClick={() => setConfirmPopup(true)}>Submit</button>
								</div>
							</div>
						)}

						{checklistPopup && (
							<ChecklistPopup
								rfiData={rfiData} // pass rfiData
								enclosureName={enclosuresData.find(e => e.id === checklistPopup)?.enclosure}
								data={enclosureStates[checklistPopup]?.checklist || initialChecklist}
								contractorSign={enclosureStates[checklistPopup]?.contractorSign || null}
								gcSign={enclosureStates[checklistPopup]?.gcSign || null}
								fetchChecklistData={fetchChecklistData}
								onDone={(data, contractorSign, gcSign, grade) =>
									handleChecklistSubmit(checklistPopup, data, contractorSign, gcSign, grade)
								}
								onClose={() => setChecklistPopup(null)}
							/>
						)}


						{uploadPopup && (
							<UploadPopup
								onSubmit={file => handleUploadSubmit(uploadPopup, file)}
								onClose={() => setUploadPopup(null)}
							/>
						)}

						{confirmPopup && <ConfirmationPopup

							inspectionStatus={inspectionStatus}
							setInspectionStatus={setInspectionStatus}
							testInLab={testInLab}
							setTestInLab={setTestInLab}
							testReportFile={testReportFile}
							setTestReportFile={setTestReportFile}
							onConfirm={handleSubmitConfirmed}
							onClose={() => setConfirmPopup(false)} 
							onCancel={() => setConfirmPopup(false)}
							/>}


						{showCamera && (
							<div className="popup">
								<CameraCapture
									facingMode={cameraMode}
									onCapture={(img) => {
										if (showCamera === 'selfie') setSelfieImage(img);
										else {
											const index = parseInt(showCamera.split('-')[1]);
											if (!isNaN(index)) {
												const updated = [...galleryImages];
												updated[index] = img;
												setGalleryImages(updated);
											}
										}
										setShowCamera(false);
									}}
									onCancel={() => setShowCamera(false)}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function ChecklistPopup({ rfiData, enclosureName, data, contractorSign, gcSign,fetchChecklistData, onDone, onClose }) {
	const [checklist, setChecklist] = useState(data);
	const [contractorSignature, setContractorSignature] = useState(contractorSign);
	const [gcSignature, setGcSignature] = useState(gcSign);
	const [gradeOfConcrete, setGradeOfConcrete] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	useEffect(() => {
			const fetchData = async () => {
				if (!rfiData?.id || !enclosureName) return;
				const result = await fetchChecklistData(rfiData.id, enclosureName);
				console.log("Fetched checklist result:");
				console.dir(result);
				if (result?.checklist) {
					setChecklist(result.checklist);
					setGradeOfConcrete(result.gradeOfConcrete || '');
					// You can also set contractorSign and gcSign if returned
				}
			};
			if (rfiData?.id && enclosureName) {
				fetchData();
			}
		}, [rfiData?.id, enclosureName, fetchChecklistData]);


	const handleChange = (id, field, value) => {
		setChecklist(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
	};

	const handleDone = () => {
	   const invalid = checklist.filter(row => !['YES','NO','NA'].includes(row.status));
	   if (invalid.length > 0) {
	     setErrorMsg('⚠️ Please select YES, NO, or N/A for **all** checklist items.');
	     return;
	   }
	   setErrorMsg('');
	   onDone(checklist, contractorSignature, gcSignature, gradeOfConcrete);
	 };
	return (
		<div className="popup">
			<div className="form-row">
				<div className="form-fields flex-1">
					<label>Name Of Work:</label>
					<input type="text" readOnly value={rfiData.work || ''} />
				</div>
			</div>
			<div className="form-row">
				<div className="form-fields flex-2">
					<label>Location:</label>
					<input type="text" name="location_ch" value={rfiData.location || ''} readOnly />
				</div>
				<div className="form-fields flex-2">
					<label>Date:</label>
					<input type="text" name="date" value={rfiData.dateOfInspection || ''} readOnly />
				</div>
			</div>
			<div className="form-row">
				<div className="form-fields flex-2">
					<label>Structure Type:</label>
					<input type="text" name="structure_type" value={rfiData.structureType || ''} readOnly />
				</div>
				<div className="form-fields flex-2">
					<label>Component:</label>
					<input type="text" name="component" value={rfiData.component || ''} readOnly />
				</div>
			</div>
			<div className="form-row">
				<div className="form-fields flex-2">
					<label>RFI No:</label>
					<input type="text" name="rfi_id" value={rfiData.rfi_Id || ''} readOnly />
				</div>
				<div className="form-fields flex-2">
					<label>Grade of Concrete:</label>
					<input
						type="text"
						name="concrete_grade"
						id="concrete_grade"
						value={gradeOfConcrete}
						onChange={e => setGradeOfConcrete(e.target.value)}
					/>
				</div>
			</div>
			<h3>CHECKLIST FOR CONCRETE/SHUTTERING & REINFORCEMENT</h3>
			
			<table>
				<thead>
					<tr><th>ID</th><th>Description</th><th>Yes</th><th>No</th><th>N/A</th><th>Contractor Remark</th><th>AE Remark</th></tr>
				</thead>
				<tbody>
					{checklist.map(row => (
						<tr key={row.id}>
							<td>{row.id}</td>
							<td>{row.description}</td>
							<td><input type="radio" checked={row.status === 'YES'} onChange={() => handleChange(row.id, 'status', 'YES')} />
							</td>
							<td><input type="radio" checked={row.status === 'NO'} onChange={() => handleChange(row.id, 'status', 'NO')} />
							</td>
							<td><input type="radio" checked={row.status === 'NA'} onChange={() => handleChange(row.id, 'status', 'NA')} />
							</td>
							<td><input value={row.contractorRemark} onChange={e => handleChange(row.id, 'contractorRemark', e.target.value)} /></td>
							<td><input value={row.aeRemark} onChange={e => handleChange(row.id, 'aeRemark', e.target.value)} /></td>
						</tr>
					))}
				</tbody>
			</table>
			{errorMsg && (
						       <div style={{ color: 'red', marginBottom: '1rem' }}>{errorMsg}</div>
						     )}
			<label>Contractor Signature:</label>
			<input type="file" onChange={(e) => setContractorSignature(e.target.files[0])} />
			<label>GC Signature:</label>
			<input type="file" onChange={(e) => setGcSignature(e.target.files[0])} />

			<div className="popup-actions">
				<button onClick={handleDone}>Done</button>
				<button onClick={onClose}>Cancel</button>
			</div>
		</div>
	);
}

function UploadPopup({ onSubmit, onClose }) {
	const [file, setFile] = useState(null);

	return (
		<div className="popup">
			<h3>Upload File</h3>
			<input type="file" onChange={e => setFile(e.target.files[0])} />
			<div className="popup-actions">
				<button disabled={!file} onClick={() => onSubmit(file)}>Upload</button>
				<button onClick={onClose}>Cancel</button>
			</div>
		</div>
	);
}

function ConfirmationPopup({ inspectionStatus, setInspectionStatus, testInLab, setTestInLab, testReportFile, setTestReportFile, onConfirm, onCancel }) {
	return (
		<div className="popup">
			<h3>Confirm Inspection</h3>
			<label>Tests in Site/Lab</label>
			<select value={inspectionStatus} onChange={e => setInspectionStatus(e.target.value)}>
				<option value="">Select</option>
				<option value="VISUAL">Visual</option>
				<option value="LAB_TEST">Lab Test</option>
				<option value="SITE_TEST">Site Test</option>
			</select>

			{deptFK?.toLowerCase() === 'engg' && (
				<div>
					<label>Inspection Status</label>
					<select
						value={testInLab === null ? '' : testInLab.toString()}
						onChange={(e) => {
							const value = e.target.value;
							if (value === 'Accepted') setTestInLab('Accepted');
							else if (value === 'Rejected') setTestInLab('Rejected');
							else setTestInLab(null);
						}}
					>
						<option value="">Select</option>
						<option value="Accepted">Accepted</option>
						<option value="Rejected">Rejected</option>
					</select>
				</div>
			)}

			{deptFK?.toLowerCase() !== 'engg' && inspectionStatus !== 'VISUAL' && (
				<div>
					<label>Upload Test Report Here</label>
					<input
						type="file"
						onChange={(e) => setTestReportFile(e.target.files[0])}
					/>
					{testReportFile && (
						<p>Selected file: <strong>{testReportFile.name}</strong></p>
					)}
				</div>
			)}

			<div className="popup-actions">
				<button onClick={onConfirm}>Done</button>
				<button
				         onClick={() => {
				           // Reset values optionally (comment out if undesired)
				           setInspectionStatus('');
				           setTestInLab(null);
				           setTestReportFile(null);

				           // Close popup
				           onCancel();
				         }}
				       >
				         Cancel
				       </button>
			</div>
		</div>
	);
}