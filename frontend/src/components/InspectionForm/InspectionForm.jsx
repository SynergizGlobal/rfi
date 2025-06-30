import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import CameraCapture from '../CameraCapture/CameraCapture';
import './InspectionForm.css';

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
	const [galleryImages, setGalleryImages] = useState({});
	const [enclosureStates, setEnclosureStates] = useState({});
	const [checklistPopup, setChecklistPopup] = useState(null);
	const [uploadPopup, setUploadPopup] = useState(null);
	const [showCamera, setShowCamera] = useState(false);
	const [cameraMode, setCameraMode] = useState('environment');
	const [gradeOfConcrete, setGradeOfConcrete] = useState('');
	const [chainage, setChainage] = useState('');
	const [inspectionStatus, setInspectionStatus] = useState('');
	const [testInLab, setTestInLab] = useState(null);


	useEffect(() => {
		if (id) {
			fetch(`http://localhost:8000/rfi/rfi-details/${id}`, {
				credentials: 'include',
			})
				.then(res => res.json())
				.then(data => {
					setRfiData(data);
					setContractorRep(data.nameOfRepresentative || '');
				})
				.catch(err => console.error("Error fetching RFI:", err));
		}
	}, [id]);

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
		const dto = {
			rfiId: rfiData.id,
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
			const res = await fetch("http://localhost:8000/rfi/save", {
				method: "POST",
				body: formData,
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




	const handleUploadSubmit = async (id, file) => {
		const formData = new FormData();

		formData.append('rfiId', rfiData.id);
		formData.append('file', file);

		try {
			const res = await fetch('http://localhost:8000/rfi/upload', {
				method: 'POST',
				body: formData,
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
		const formData = new FormData();


		const inspectionPayload = {
			rfiId: rfiData.id,
			location: locationText,
			chainage: chainage,
			inspectionStatus: inspectionStatus,
			testInsiteLab: testInLab

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


		Object.entries(galleryImages).forEach(([key, file]) => {
			if (file instanceof File) {
				formData.append('siteImages', file);
			}
		});

		try {
			const res = await fetch('http://localhost:8000/rfi/start', {
				method: 'POST',
				body: formData,
			});
			const text = await res.text();
			alert("Saved: " + text);
		} catch (err) {
			console.error("Inspection save failed:", err);
		}
	};


	if (!rfiData) return <div>Loading RFI details...</div>;

	return (
		<div className="dashboard create-rfi inspection-form">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-inspection-form">

						{/* Step 1 */}
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

						{/* Step 2 */}
						{step === 2 && (
							<div className="form-step">
								<h2>RFI Inspection - Step 2</h2>
								<div className="form-grid">
									<div className="form-left">
										<label>Location:</label>
										<input value={locationText} onFocus={fetchLocation} onChange={e => setLocationText(e.target.value)} />
										<label>Date of Inspection:</label>
										<input type="date" value={rfiData.dateOfInspection} readOnly />
										<label>Time of Inspection:</label>
										<input type="time" value={rfiData.timeOfInspection} readOnly />
										<label>Contractor's Representative:</label>
										<input value={contractorRep} onChange={e => setContractorRep(e.target.value)} />
									</div>
									<div className="upload-grid">
										{[1, 2, 3, 4].map(i => (
											<div key={i} className="capture-option">
												<button onClick={() => { setCameraMode('environment'); setShowCamera(`gallery-${i}`); }}>
													📷 Capture Image {i}
												</button>
												<input
													type="file"
													accept="image/*"
													onChange={e => {
														const file = e.target.files[0];
														if (file) {
															setGalleryImages(prev => ({ ...prev, [`gallery-${i}`]: file }));
														}

													}}
												/>
												{galleryImages[`gallery-${i}`] && (
													<img src={galleryImages[`gallery-${i}`]} alt={`Site ${i}`} className="gallery-preview" />
												)}
											</div>
										))}
									</div>
								</div>

								<h3>Enclosures</h3>
								<table className="enclosure-table">
									<thead>
										<tr><th>RFI Description</th><th>Enclosure</th><th>Action</th><th>Uploaded</th></tr>
									</thead>
									<tbody>
										{enclosuresData.map(e => {
											const state = enclosureStates[e.id] || {};
											return (
												<tr key={e.id}>
													<td>{e.rfiDescription}</td>
													<td>{e.enclosure}</td>
													<td>
														<button disabled={state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Open</button>
														<button disabled={!state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Edit</button>
														<button onClick={() => setUploadPopup(e.id)}>Upload</button>
													</td>
													<td>{state.uploadedFile?.name || ''}</td>
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
								data={enclosureStates[checklistPopup]?.checklist || initialChecklist}
								contractorSign={enclosureStates[checklistPopup]?.contractorSign || null}
								gcSign={enclosureStates[checklistPopup]?.gcSign || null}
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
							setTestInLab={setTestInLab} onClose={() => setConfirmPopup(false)} />}

						{showCamera && (
							<div className="popup">
								<CameraCapture
									facingMode={cameraMode}
									onCapture={(img) => {
										if (showCamera === 'selfie') setSelfieImage(img);
										else setGalleryImages(prev => ({ ...prev, [showCamera]: img }));
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

function ChecklistPopup({ rfiData, data, contractorSign, gcSign, onDone, onClose }) {
	const [checklist, setChecklist] = useState(data);
	const [contractorSignature, setContractorSignature] = useState(contractorSign);
	const [gcSignature, setGcSignature] = useState(gcSign);
	const [gradeOfConcrete, setGradeOfConcrete] = useState('');




	const handleChange = (id, field, value) => {
		setChecklist(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
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
			<label>Contractor Signature:</label>
			<input type="file" onChange={(e) => setContractorSignature(e.target.files[0])} />
			<label>GC Signature:</label>
			<input type="file" onChange={(e) => setGcSignature(e.target.files[0])} />

			<div className="popup-actions">
				<button onClick={() => onDone(checklist, contractorSignature, gcSignature, gradeOfConcrete)}>Done</button>
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

function ConfirmationPopup({ inspectionStatus, setInspectionStatus, testInLab, setTestInLab, onClose }) {
	return (
		<div className="popup">
			<h3>Confirm Inspection</h3>
			<label>Inspection Status</label>
			<select value={inspectionStatus} onChange={e => setInspectionStatus(e.target.value)}>
				<option value="">Select</option>
				<option value="VISUAL">Visual</option>
				<option value="LAB_TEST">Lab Test</option>
				<option value="SITE_TEST">Site Test</option>
			</select>
			<label>Tests in Site/Lab</label>
			<select
				value={testInLab === null ? '' : testInLab.toString()}
				onChange={(e) => {
					const value = e.target.value;
					if (value === 'true') setTestInLab(true);
					else if (value === 'false') setTestInLab(false);
					else setTestInLab(null);
				}}
			>
				<option value="">Select</option>
				<option value="true">Accepted</option>
				<option value="false">Rejected</option>
			</select>


			<div className="popup-actions">
				<button onClick={onClose}>Done</button>
			</div>
		</div>
	);
}
