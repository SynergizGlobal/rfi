import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import CameraCapture from '../CameraCapture/CameraCapture';
import axios from "axios"
import DataTable from "react-data-table-component"
import './InspectionForm.css';
import { saveOfflineInspection, saveOfflineEnclosure, getAllOfflineEnclosures, getAllOfflineInspections, removeOfflineInspection, removeOfflineEnclosure, clearOfflineEnclosures } from '../../utils/offlineStorage';
import { useNavigate } from "react-router-dom";
import { generateInspectionPdf, mergeWithExternalPdfs, toBase64 } from '../../utils/pdfUtils';
import { connectEsignSocket, disconnectEsignSocket } from "../../utils/esignSocket";

const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();
const isEngineer = deptFK === "engg";
let globalVarConSubmited = null;
let globalVarEnggSubmited = null;


export default function InspectionForm() {
	const navigate = useNavigate();

	const location = useLocation();
	const id = location.state?.rfi;
	const skipSelfie = location.state?.skipSelfie;
	const [viewMode, setViewMode] = useState(location.state?.viewMode || false);
	const [step, setStep] = useState(skipSelfie ? 2 : 1);
	const [rfiData, setRfiData] = useState(null);
	const [locationText, setLocationText] = useState('');
	const [contractorRep, setContractorRep] = useState('');
	const [selfieImage, setSelfieImage] = useState(null);
	const [siteImage, setSiteImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([null, null, null, null]);
	const [inspectionStatusMode, setInspectionStatusMode] = useState("DRAFT");
	const [inspectionStatusUserSelection, setInspectionStatusUserSelection] = useState("");
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
	const [enclosuresData, setEnclosuresData] = useState([]);
	const [checklistData, setChecklistData] = useState([]);
	const [enclosureActions, setEnclosureActions] = useState({});
	const [overallComments, setOverallComments] = useState('');
	const [engineerRemarks, setEngineerRemarks] = useState("");
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	const selfieRef = useRef(null);
	const firstGalleryRef = useRef(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [supportingUploadPopup, setSupportingUploadPopup] = useState(false); // <-- fix for your error
	const [supportingDocs, setSupportingDocs] = useState([]); // stores File objects (or uploaded file metadata)
	const [supportingDescriptions, setSupportingDescriptions] = useState([]);
	const [supportingFiles, setSupportingFiles] = useState([]);
	const contractorSubmitted = rfiData?.inspectionDetails?.some(
		d => d.uploadedBy === "CON" && d.workStatus?.toUpperCase() === "SUBMITTED"
	);
	globalVarConSubmited = contractorSubmitted;

	const engineerSubmitted = rfiData?.inspectionDetails?.some(
		d => d.uploadedBy === "Engg" && d.workStatus?.toUpperCase() === "SUBMITTED"
	);
	globalVarEnggSubmited = engineerSubmitted;

	const getDisabled = () => {
		if (inspectionStatusMode === "DRAFT") return false;

		if (isEngineer) {
			return engineerSubmitted;
		} else {
			return contractorSubmitted;
		}
	};

	{/* STATE: Add this above (inside your component) */ }
	const [customUnits, setCustomUnits] = useState({
		Length: [],
		Area: [],
		Volume: [],
		Weight: [],
		Number: []
	});

	const baseUnits = {
		Length: ["mm", "cm", "m", "km", "in", "ft"],
		Area: ["cm²", "m²", "km²", "ft²"],
		Volume: ["cm³", "m³", "L", "mL"],
		Weight: ["kg", "g", "ton"],
		Number: ["Nos"],
	};



	useEffect(() => {
		if (id) {
			fetch(`${API_BASE_URL}rfi/rfi-details/${id}`, { credentials: "include" })
				.then((res) => res.json())
				.then((data) => {
					setRfiData(data);
					setContractorRep(data.nameOfRepresentative || "");

					// ✅ Handle Enclosures
					if (data.enclosures) {
						const enclosuresArr = Array.isArray(data.enclosures)
							? data.enclosures
							: data.enclosures.split(",").map((enc) => enc.trim());

						// 🔹 Prepare file mapping if backend has uploaded enclosure files
						// 🔹 Handle uploaded enclosure files from backend
						const uploadedEnclosures = Array.isArray(data.enclosure)
							? data.enclosure.map((e) => ({
								name: e.enclosureName?.trim(),
								filePath: e.enclosureUploadFile || e.filePath || null,
								fileId: e.id || null,
							}))
							: Array.isArray(data.enclosures)
								? data.enclosures
									.filter((e) => typeof e === "object")
									.map((e) => ({
										name: e.enclosureName?.trim(),
										filePath: e.enclosureUploadFile || e.filePath || null,
										fileId: e.id || null,
									}))
								: [];


						const formatted = enclosuresArr.map((enc, index) => {
							const uploadedFile = uploadedEnclosures.find(
								(e) => e.name?.trim().toLowerCase() === enc.trim().toLowerCase()
							);

							return {
								id: `${data.id}-${index}`,
								rfiDescription: data.rfiDescription,
								enclosure: enc,
								filePath: uploadedFile?.filePath || null, // ✅ for PDF generation
								fileId: uploadedFile?.fileId || null,
							};
						});

						setEnclosuresData(formatted);

						// ✅ Existing logic - unchanged
						const fetchEnclosureActions = async () => {
							const actionsState = {};
							const checklistState = {};

							for (const item of formatted) {
								try {
									const result = await fetchChecklistDataFromApi(id, item.enclosure);

									if (result) {
										let hasData = false;
										if (Array.isArray(result.checklist)) {
											const dept = deptFK?.toLowerCase();

											if (dept === "engg") {
												hasData = result.checklist.some(
													(chk) =>
														(chk.engineerStatus && chk.engineerStatus.trim() !== "") ||
														(chk.engineerRemark && chk.engineerRemark.trim() !== "")
												);
											} else if (dept && dept !== "engg") {
												hasData = result.checklist.some(
													(chk) =>
														(chk.contractorStatus && chk.contractorStatus.trim() !== "") ||
														(chk.contractorRemarks && chk.contractorRemarks.trim() !== "")
												);
											} else {
												hasData = result.checklist.some(
													(chk) =>
														(chk.contractorStatus && chk.contractorStatus.trim() !== "") ||
														(chk.contractorRemarks && chk.contractorRemarks.trim() !== "") ||
														(chk.engineerStatus && chk.engineerStatus.trim() !== "") ||
														(chk.engineerRemark && chk.engineerRemark.trim() !== "")
												);
											}
										}

										const action = hasData ? "EDIT" : "OPEN";
										actionsState[item.id] = action;
										checklistState[item.id] = {
											checklist: result.checklist || [],
											gradeOfConcrete: result.gradeOfConcrete || "",
											checklistDone: hasData,
										};
									} else {
										actionsState[item.id] = "UPLOAD";
										checklistState[item.id] = {
											checklist: [],
											gradeOfConcrete: "",
											checklistDone: false,
										};
									}
								} catch (err) {
									console.log("Error fetching checklist for enclosure:", item.enclosure, err);
									actionsState[item.id] = "UPLOAD";
									checklistState[item.id] = {
										checklist: [],
										gradeOfConcrete: "",
										checklistDone: false,
									};
								}
							}

							setEnclosureActions(actionsState);
							setEnclosureStates(checklistState);
						};

						fetchEnclosureActions();
					}

					// ✅ Existing inspection logic - untouched
					if (Array.isArray(data.inspectionDetails) && data.inspectionDetails.length > 0) {
						const contractorInspection = data.inspectionDetails
							.filter((det) => det.uploadedBy === "CON")
							.sort((a, b) => b.id - a.id)[0];

						const engineerInspection = data.inspectionDetails
							.filter((det) => det.uploadedBy === "Engg")
							.sort((a, b) => b.id - a.id)[0];

						if (deptFK.toLowerCase() === "con" && contractorInspection) {
							setInspectionId(contractorInspection.id);
						} else if (deptFK.toLowerCase() === "engg" && engineerInspection) {
							setInspectionId(engineerInspection.id);
						}
					} else {
						const savedId = localStorage.getItem("latestInspectionId");
						if (savedId) {
							setInspectionId(parseInt(savedId));
						}
					}
				})
				.catch((err) => console.error("Error fetching RFI details:", err));
		}
	}, [id, API_BASE_URL]);



	const fetchChecklistDataFromApi = async (rfiId, enclosureName) => {
		try {
			const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

			try {
				const existingResponse = await axios.get(
					`${API_BASE_URL}api/v1/enclouser/checklist-items?enclosureName=${encodeURIComponent(enclosureName)}&rfiId=${rfiId}`,
					{ withCredentials: true }
				);

				if (existingResponse.data && existingResponse.data.length > 0) {
					console.log("Existing checklist data:", existingResponse.data);

					const formattedChecklist = existingResponse.data.map((item, index) => ({
						id: index + 1,
						checklistDescId: item.checklistDescId,
						description: item.checklistDescription,
						contractorStatus: item.contractorStatus || '',
						engineerStatus: item.engineerStatus,
						contractorRemark: item.contractorRemarks || '',
						aeRemark: item.engineerRemark || '',
						enclosureName: enclosureName
					}));

					return {
						checklist: formattedChecklist,
						gradeOfConcrete: existingResponse.data[0]?.gradeOfConcrete || '',
						action: 'EDIT'
					};
				}
			} catch (existingError) {
				console.log("No existing checklist data found, fetching template:", existingError);
			}

			const response = await axios.get(
				`${API_BASE_URL}api/v1/enclouser/description?enclosername=${encodeURIComponent(enclosureName)}`
			);

			if (response.data && response.data.length > 0) {
				let allChecklistItems = [];

				response.data.forEach(item => {
					if (item.checklistDescription) {
						const descriptions = item.checklistDescription.split(',');
						descriptions.forEach(desc => {
							allChecklistItems.push({
								checklistDescId: item.checklistDescId,
								description: desc.trim(),
								status: '',
								contractorRemark: '',
								aeRemark: '',
								enclosureName
							});
						});
					}
				});

				const uniqueItems = allChecklistItems.filter((item, index, self) =>
					index === self.findIndex(t => t.checklistDescId === item.checklistDescId)
				);

				const formattedChecklist = uniqueItems.map((item, index) => ({
					id: index + 1,
					checklistDescId: item.checklistDescId,
					description: item.description,
					status: item.status,
					contractorRemark: item.contractorRemark,
					aeRemark: item.aeRemark
				}));

				return {
					checklist: formattedChecklist,
					gradeOfConcrete: '',
					action: response.data[0].action || 'OPEN'
				};
			}
			return null;
		} catch (err) {
			console.log("Error fetching checklist data:", err);
			return null;
		}
	};

	useEffect(() => {
		const now = new Date();
		setDateOfInspection(now.toISOString().split("T")[0]);
		setTimeOfInspection(now.toTimeString().split(" ")[0].slice(0, 5));
	}, []);

	const fetchLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async position => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					try {
						const res = await fetch(
							`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
						);
						const geoData = await res.json();
						setLocationText(geoData.display_name || `Lat: ${lat}, Lng: ${lng}`);
					} catch {
						setLocationText(`Lat: ${lat}, Lng: ${lng}`);
					}
				},
				() => setLocationText("Location access denied")
			);
		}
	};

	function dataURLtoFile(dataUrl, filename) {
		if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
			console.warn("⚠️ Invalid data URL, skipping:", dataUrl);
			return null;
		}

		try {
			const arr = dataUrl.split(",");
			const mimeMatch = arr[0].match(/:(.*?);/);
			const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
			const bstr = atob(arr[1]);
			let n = bstr.length;
			const u8arr = new Uint8Array(n);

			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}

			return new File([u8arr], filename, { type: mime });
		} catch (error) {
			console.error("❌ Failed to convert dataURL to File:", error);
			return null;
		}
	}


	const handleChecklistSubmit = async (id, checklistData, grade) => {
		const enclosure = enclosuresData.find(e => e.id === id)?.enclosure || '';

		const dto = {
			rfiId: rfiData.id,
			enclosureName: enclosure,
			gradeOfConcrete: grade || "",
			uploadedBy: deptFK,
			checklistRows: checklistData.map(row => ({
				checklistDescriptionId: row.checklistDescId,
				description: row.description,
				contractorStatus: row.contractorStatus,
				engineerStatus: row.engineerStatus,
				contractorRemark: row.contractorRemark,
				aeRemark: row.aeRemark
			}))
		};

		const formData = new FormData();
		formData.append("data", JSON.stringify(dto));

		try {
			const res = await fetch(`${API_BASE_URL}rfi/saveChecklist`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			if (!res.ok) {
				const errorText = await res.text();
				alert(`Checklist save failed: ${res.status} - ${errorText}`);
				return;
			}

			const responseText = await res.text();
			console.log("Checklist save response:", responseText);

			// ✅ update states
			setEnclosureStates(prev => ({
				...prev,
				[id]: {
					checklist: checklistData,
					gradeOfConcrete: grade,
					checklistDone: true,
				}
			}));

			// ✅ update actions so button shows "Edit"
			setEnclosureActions(prev => ({
				...prev,
				[id]: "EDIT"
			}));

			setChecklistPopup(null);
			alert("Checklist saved successfully!");
		} catch (err) {
			console.error("Checklist save failed:", err);
			alert("Checklist save failed: " + err.message);
		}
	};

	async function checkPdfEncrypted(file) {
		const arrayBuffer = await file.arrayBuffer();
		const uint8 = new Uint8Array(arrayBuffer);

		// Simple check for Encryption Dictionary in header
		const text = new TextDecoder().decode(uint8.slice(0, 2048));

		return text.includes("/Encrypt") || text.includes("/ENCRYPT");
	}



	const handleUploadSubmit = async (id, file) => {
		const enclosureName = enclosuresData.find(e => e.id === id)?.enclosure || '';

		const maxSize = 100 * 1024 * 1024;
		if (file.size > maxSize) {
			alert("❌ File is too large. Maximum allowed size is 100 MB.");
			return;
		}

		// 2️⃣ Reject Excel files
		const ext = file.name.split('.').pop().toLowerCase();
		const blockedExt = ["xlsx", "xls", "csv", "doc", "docx"];

		if (blockedExt.includes(ext)) {
			alert("❌ Excel & Word files are not allowed. Please upload PDF files only.");
			return;
		}


		// 3️⃣ Detect encrypted PDFs (optional but recommended)
		if (ext === "pdf") {
			const isEncrypted = await checkPdfEncrypted(file);
			if (isEncrypted) {
				alert("❌ Encrypted PDF is not allowed. Please upload a normal PDF.");
				return;
			}
		}


		if (!navigator.onLine) {
			const offlineEnclosure = {
				enclosureName,
				file
			};
			await saveOfflineEnclosure(rfiData.id, offlineEnclosure);
			setEnclosureStates(prev => ({
				...prev,
				[id]: { ...prev[id], uploadedFile: file }
			}));

			setUploadPopup(null);
			return;
		}

		const formData = new FormData();
		formData.append('rfiId', rfiData.id);
		formData.append('file', file);
		formData.append('enclosureName', enclosureName);


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

			setEnclosureStates(prev => ({
				...prev,
				[id]: {
					...prev[id],
					uploadedFile: prev[id]?.uploadedFile
						? [
							...(Array.isArray(prev[id].uploadedFile)
								? prev[id].uploadedFile
								: [prev[id].uploadedFile]),
							file
						]
						: [file]
				}
			}));

			await fetchUpdatedRfiData(rfiData.id);
			alert("✅ Enclosure File uploaded successfully.");

			setUploadPopup(null);
		} catch (err) {
			console.error("Upload failed:", err);
			alert("Upload failed: " + err.message);
		}
	};


	const fetchEnclosuresData = async (rfiId, setEnclosuresData) => {
		try {
			const res = await fetch(`${API_BASE_URL}rfi/enclosures/${rfiId}`, {
				method: "GET",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) {
				const txt = await res.text().catch(() => "");
				throw new Error(`Failed: ${txt || res.status}`);
			}

			const data = await res.json();

			// 💥 Fix UI not updating / stale state
			setEnclosuresData([]);
			setTimeout(() => setEnclosuresData(data), 0);

		} catch (err) {
			console.error("Fetch error:", err);
			setEnclosuresData([]);
		}
	};




	const [measurements, setMeasurements] = useState([
		{ type: "", L: "", B: "", H: "", No: "", total: "", weight: "", units: "" },
	]);


	const handleAddMeasurement = () => {
		setMeasurements((prev) => [
			...prev,
			{ type: "", L: "", B: "", H: "", No: "", total: "", weight: "", units: "" },
		]);
	};

	const handleDeleteMeasurement = (index) => {
		setMeasurements((prev) => prev.filter((_, i) => i !== index));
	};


	const handleMeasurementChange = (index, field, value) => {
		setMeasurements((prev) => {
			const updated = [...prev];
			updated[index][field] = value;

			const { type, L, B, H, weight, No, units } = updated[index];

			const num = parseFloat(No) || 1; // default quantity
			const length = parseFloat(L) || 0;
			const breadth = parseFloat(B) || 0;
			const height = parseFloat(H) || 0;
			let w = parseFloat(weight) || 0;


			let total = 0;

			// Calculate total based on type
			if (type === "Area") {
				total = length * breadth * num;
			} else if (type === "Length") {
				total = length * num;
			} else if (type === "Volume") {
				total = length * breadth * height * num;
			} else if (type === "Number") {
				total = num;
			} else if (type === "Weight") {
				total = w * num;

			}

			updated[index].total = total;
			updated[index].weight = w;

			return updated;
		});
	};



	const [errors, setErrors] = useState({});



	const handleSaveDraft = async () => {
		if (isSaving) return;
		setIsSaving(true);

		setInspectionStatusMode("DRAFT");

		// Prepare supportingFiles and supportingDescriptions from supportingDocs state
		const supportingFiles = supportingDocs.map(doc => doc.file);
		const supportingDescriptions = supportingDocs.map(doc => doc.description);

		// Offline handling
		if (!navigator.onLine) {
			const offlineData = {
				inspectionId: inspectionId || Date.now(), // unique ID if new
				rfiId: rfiData.id,
				selfieImage: selfieImage || null,
				galleryImages: galleryImages || [],
				testReportFile: testReportFile || null,
				supportingFiles

			};
			await saveOfflineInspection(offlineData);
			alert("📌 Draft saved offline successfully!");
			setIsSaving(false);
			return;
		}

		// Online handling: FormData for multipart upload
		const formData = new FormData();

		const inspectionPayload = {
			inspectionId: inspectionId || null,
			rfiId: rfiData.id,
			location: locationText || null,
			chainage: chainage || null,
			nameOfRepresentative: contractorRep || null,
			measurementType: measurements[0]?.type || null,
			length: parseFloat(measurements[0]?.L) || null,
			breadth: parseFloat(measurements[0]?.B) || null,
			height: parseFloat(measurements[0]?.H) || null,
			weight: parseFloat(measurements[0]?.weight) || null,  // <-- use 'weight'

			units: measurements[0]?.units || null,   // <-- frontend field must match DTO
			noOfItems: parseInt(measurements[0]?.No) || null,
			totalQty: measurements.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0) || null,
			inspectionStatus: inspectionStatusUserSelection || null,
			testInsiteLab: testInLab || null,
			engineerRemarks: engineerRemarks || null,
			descriptionEnclosure: overallComments || '',
			supportingDescriptions,
		};

		// Append JSON payload
		formData.append("data", JSON.stringify(inspectionPayload));

		// Append selfie image if available
		if (selfieImage) {
			formData.append(
				"selfie",
				selfieImage instanceof File ? selfieImage : dataURLtoFile(selfieImage, "selfie.jpg")
			);
		}

		// Append test report if available
		if (testReportFile) {
			formData.append("testReport", testReportFile);
		}

		// Append supporting files
		supportingFiles.forEach((file) => {
			formData.append("supportingFiles", file);
		});

		try {
			const res = await fetch(`${API_BASE_URL}rfi/saveDraft`, {
				method: "POST",
				body: formData,
				credentials: "include"
			});

			if (!res.ok) throw new Error(await res.text());

			const id = await res.json();
			// setInspectionId(id); // if needed
			alert("✅ Draft saved successfully!");
			setIsSaving(false);
			navigate("/inspection"); // Redirect after save

		} catch (err) {
			console.error("Draft save failed:", err);
			alert(`❌ Draft save failed: ${err.message}`);
			setIsSaving(false);
		}
	};



	const validateStep = () => {
		const newErrors = {};

		// ✅ Location is mandatory
		if (!locationText || locationText.trim() === '') {
			newErrors.location = "Location is required";
		}

		// ✅ At least one measurement with valid values
		const hasValidMeasurement = measurements.some(m => {
			if (!m.type) return false;
			switch (m.type) {
				case "Number":
					return m.No !== null && m.No !== "";
				case "Length":
					return m.L !== null && m.L !== "";
				case "Area":
					return m.L !== null && m.B !== null && m.total !== null;
				case "Volume":
					return m.L !== null && m.B !== null && m.H !== null && m.total !== null;
				case "Weight":
					return m.L !== null && m.B !== null && m.H !== null && m.total !== null;
				default:
					return false;
			}
		});

		if (!hasValidMeasurement) {
			newErrors.measurements = "Please fill at least one measurement completely";
		}


		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};



	const getEnclosuresForRfi = async (rfiId) => {
		const res = await fetch(`${API_BASE_URL}rfi/enclosures/${rfiId}`, {
			method: "GET",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});
		if (!res.ok) {
			const txt = await res.text().catch(() => "");
			throw new Error(`Failed to fetch enclosures: ${txt || res.status}`);
		}
		return res.json(); // expected: [{ enclosureName: "...", files: [...] }, ...]
	};

	// Helper: convert backend path to preview URL (or keep File/base64/absolute URLs)
	const convertToPreviewUrl = (f) => {
		if (!f && f !== 0) return null;
		if (f instanceof File) return f;
		if (typeof f !== "string") return f;
		const s = f.trim();
		if (!s) return null;
		if (s.startsWith("data:")) return s;
		if (/^https?:\/\//i.test(s)) return s;
		if (s.includes("/api/validation/previewFiles")) return s;
		return `${API_BASE_URL}api/validation/previewFiles?filepath=${encodeURIComponent(s)}`;
	};

	// Helper: normalize backend + local uploaded files into a list of enclosures
	// Normalize backend enclosures and merge local uploaded files + checklist
	const normalizeAndMergeEnclosures = (backendEnclosures = [], enclosureStates = {}) => {
		const map = {};

		// ✅ helper to validate name
		const sanitizeName = (name) => {
			if (!name) return null;
			if (typeof name !== "string") return null;
			const v = name.trim();
			return v.length ? v : null;
		};

		// 1️⃣ Backend enclosures
		(backendEnclosures || []).forEach(row => {
			const name = sanitizeName(row.enclosureName || row.enclosure);
			if (!name) return;   // ✅ skip invalid

			if (!map[name]) {
				map[name] = { enclosure: name, description: row.description || "", files: [], checklist: [], _ids: [] };
			}

			if (Array.isArray(row.files)) {
				row.files.forEach(f => f && map[name].files.push(f));
			}

			if (row.id != null) map[name]._ids.push(String(row.id));

			if (Array.isArray(row.checklist)) {
				row.checklist.forEach(item => {
					item.enclosureName = name;
					map[name].checklist.push(item);
				});
			}
		});

		// 2️⃣ Local enclosureStates
		Object.entries(enclosureStates || {}).forEach(([key, st]) => {
			if (!st) return;

			let name = sanitizeName(st.enclosureName || st.enclosure);

			// try from checklist
			if (!name && Array.isArray(st.checklist) && st.checklist.length > 0) {
				name = sanitizeName(st.checklist[0].enclosureName);
			}

			if (!name) return;   // ✅ do not create ghost enclosure

			if (!map[name]) {
				map[name] = { enclosure: name, description: st.description || "", files: [], checklist: [], _ids: [] };
			}

			// files
			if (st.uploadedFile) {
				const files = Array.isArray(st.uploadedFile) ? st.uploadedFile : [st.uploadedFile];
				map[name].files.push(...files.filter(Boolean));
			}

			// checklist
			if (Array.isArray(st.checklist)) {
				st.checklist.forEach(item => {
					item.enclosureName = name;
					map[name].checklist.push(item);
				});
			}
		});

		// ✅ remove empty invalid enclosures
		return Object.values(map).filter(e =>
			e.enclosure &&
			(e.files.length > 0 || e.checklist.length > 0)
		);
	};



	const handleSubmitInspection = async () => {
		if (!validateStep()) {
			alert("⚠️ Please fill required data before submitting.");
			return;
		}

		// Engineer must select inspection status
		if (deptFK?.toLowerCase() === "engg" && !testInLab) {
			alert("Inspection Status is mandatory!");
			return;
		}
		// If rejected → remarks required
		if (deptFK?.toLowerCase() === "engg" && testInLab === "Rejected" && !engineerRemarks.trim()) {
			alert("Remarks are mandatory when Inspection is Rejected!");
			return;
		}

		if (!validateEnclosures()) {
			return; // block submission if enclosures incomplete
		}

		if (isSubmitting) return;

		// Contractor rules
		if (!isEngineer) {
			const hasNo = Object.values(enclosureStates).some(enc =>
				enc.checklist?.some(row => row.contractorStatus === "NO")
			);
			if (hasNo) {
				alert("Submission blocked: Checklist contains 'NO'. Save as draft instead.");
				return;
			}
		}

		if (isEngineer) {
			const conflict = Object.values(enclosureStates).some(enc =>
				enc.checklist?.some(row =>
					row.contractorStatus === "YES" && row.engineerStatus === "NO"
				)
			);
			if (conflict) {
				setTestInLab("Rejected");
				alert("⚠️ Contractor marked YES but Engineer marked NO → Inspection auto-rejected.");
			}
		}

		setIsSubmitting(true);

		try {
			// 1️⃣ Submit inspection data to backend
			const formData = new FormData();

			const supportingFiles = supportingDocs.map(doc => doc.file);
			const supportingDescriptions = supportingDocs.map(doc => doc.description);

			// Append backend files from supportingFiles state
			// assuming supportingFiles array contains File objects or URLs
			if (supportingFiles.length > 0) {
				supportingFiles.forEach(file => {
					formData.append("supportingFiles", file);
				});
			}
			const inspectionPayload = {
				inspectionId: inspectionId || null,
				rfiId: rfiData.id,
				location: locationText || null,
				chainage: chainage || null,
				nameOfRepresentative: contractorRep || null,
				measurementType: measurements[0]?.type || null,
				length: parseFloat(measurements[0]?.L) || null,
				breadth: parseFloat(measurements[0]?.B) || null,
				height: parseFloat(measurements[0]?.H) || null,
				weight: parseFloat(measurements[0]?.weight) || null,  // <-- use 'weight'
				units: measurements[0]?.units || null,   // <-- frontend field must match DTO
				noOfItems: parseInt(measurements[0]?.No) || null,
				totalQty:
					measurements.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0) ||
					null,
				inspectionStatus: inspectionStatusUserSelection || null,
				testInsiteLab: testInLab || null,
				engineerRemarks: engineerRemarks || null,
				descriptionEnclosure: overallComments || '', // ✅ add description here
				supportingDescriptions,

			};

			formData.append("data", JSON.stringify(inspectionPayload));

			if (selfieImage) {
				const selfieFile =
					selfieImage instanceof File
						? selfieImage
						: dataURLtoFile(selfieImage, "selfie.jpg");
				if (selfieFile) formData.append("selfie", selfieFile);
			}

			if (testReportFile) formData.append("testReport", testReportFile);

			// Ensure latest enclosures are loaded from backend
			// (call API that returns grouped files: files: [] )
			let backendEnclosures = [];
			try {
				backendEnclosures = await getEnclosuresForRfi(rfiData.id);
				// ensure shape: [{ enclosureName, files: [...] }, ...]
				console.log("📦 backendEnclosures", backendEnclosures);
			} catch (err) {
				console.warn("Could not fetch enclosures from backend, proceeding with local state only:", err);
				// fallback: use existing enclosuresData if present
				backendEnclosures = enclosuresData || [];
			}

			// Normalize + merge backend + UI uploaded files
			const merged = normalizeAndMergeEnclosures(backendEnclosures, enclosureStates);
			console.log("🔥 Normalized & merged enclosures:", merged);

			// Build checklistsByEnclosure - convert backend paths -> preview URLs but keep File objects
			const checklistsByEnclosure = merged.map(e => {
				const allFiles = Array.isArray(e.files) ? e.files : (e.files ? [e.files] : []);
				const converted = allFiles
					.map(f => convertToPreviewUrl(f))
					.filter(Boolean);
				return {
					enclosure: e.enclosure,
					description: e.description || "",
					checklist: Array.isArray(e.checklist) ? e.checklist : [], // keep checklist intact
					filePath: converted,
					_ids: e._ids || []
				};
			});

			console.log("📄 Checklists by enclosure prepared for PDF:", checklistsByEnclosure);


			// Fetch supporting docs from backend
			const backendSupportingDocs = await (async () => {
				try {
					const res = await fetch(`${API_BASE_URL}rfi/supporting-files/${rfiData.id}`, {
						method: "GET",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
					});
					if (!res.ok) return [];
					return res.json();
				} catch (err) {
					console.warn("No backend supporting docs", err);
					return [];
				}
			})();

			// Build full list for PDF only
			const supportingDocsForPdf = [
				...supportingDocs.map(d => ({          // UI uploaded
					file: d.file,
					description: d.description
				})),
				...backendSupportingDocs.map(d => ({   // DB saved
					file: `${API_BASE_URL}rfi/supporting-docs/${encodeURIComponent(d.fileName)}`,
					description: d.description
				}))
			];







			// ✅ Build image data separately first
			const images = {
				contractor: await Promise.all(
					(rfiData?.inspectionDetails || [])
						.filter((d) => d.uploadedBy === "CON" && d.siteImage)
						.flatMap((d) => d.siteImage.split(","))
						.map(async (imgPath) => {
							const encodedPath = encodeURIComponent(imgPath.trim());
							const imageUrl = `${API_BASE_URL}api/validation/previewFiles?filepath=${encodedPath}`;
							const base64 = await toBase64(imageUrl);
							return base64; // "data:image/jpeg;base64,..."
						})
				),
				engineer: await Promise.all(
					(rfiData?.inspectionDetails || [])
						.filter((d) => d.uploadedBy === "Engg" && d.siteImage)
						.flatMap((d) => d.siteImage.split(","))
						.map(async (imgPath) => {
							const encodedPath = encodeURIComponent(imgPath.trim());
							const imageUrl = `${API_BASE_URL}api/validation/previewFiles?filepath=${encodedPath}`;
							const base64 = await toBase64(imageUrl);
							return base64;
						})
				),
			};

			// ✅ Debugging output before PDF generation
			console.log("📸 PDF Images Prepared:", {
				contractorCount: images.contractor?.length || 0,
				engineerCount: images.engineer?.length || 0,
				contractorSamples: images.contractor?.slice(0, 2).map(i => i?.substring(0, 100) + "..."),
				engineerSamples: images.engineer?.slice(0, 2).map(i => i?.substring(0, 100) + "..."),
			});

			console.log("Prepared contractor images:", images.contractor);
			console.log("Prepared engineer images:", images.engineer);








			let testReportFileData = null;
			try {
				const contractorInspection = (rfiData.inspectionDetails || [])
					.filter((det) => det.uploadedBy === "CON")
					.sort((a, b) => b.id - a.id)[0];

				if (testReportFile instanceof File) {
					testReportFileData = testReportFile;
				}
				else if (contractorInspection?.testSiteDocuments) {
					const encodedPath = encodeURIComponent(contractorInspection.testSiteDocuments.trim());
					const fileUrl = `${API_BASE_URL}api/validation/previewFiles?filepath=${encodedPath}`;
					testReportFileData = fileUrl;
				}
				else {
					testReportFileData = null;
				}
			} catch (err) {
				console.warn("⚠️ Unable to normalize test report file:", err);
				testReportFileData = null;
			}

			// ✅ 2. Generate the inspection PDF
			const { doc, externalPdfBlobs } = await generateInspectionPdf({
				rfi_Id: rfiData.rfi_Id,
				contract: rfiData.contract,
				contractor: rfiData.createdBy,
				contractorRep,
				location: locationText,
				chainage,
				submissionDate: new Date().toLocaleDateString(),
				dateOfInspection,
				timeOfInspection,
				rfiDescription: rfiData.rfiDescription,
				StructureType: rfiData.structureType,
				Structure: rfiData.structure,
				Component: rfiData.component,
				Element: rfiData.element,
				activity: rfiData.activity,
				inspectionStatus: (testInLab || "").trim(),
				enclosures: checklistsByEnclosure,
				supportingDocs: supportingDocsForPdf, // ONLY for PDF

				measurements: measurements.map((m) => ({
					type: m.type,
					l: m.L,
					b: m.B,
					h: m.H,
					weight: m.weight || "",

					units: m.units || "",        // <-- added unit
					no: m.No,
					total: m.total,
				})),
				engineerRemarks: engineerRemarks || "",
				testReportFile: testReportFileData,
				contractorRemarks: rfiData.contractorRemarks,
				images,
			});

			// ✅ 3. Merge with external PDFs if any
			const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 50;

			const pdfBlob =
				externalPdfBlobs.length > 0
					? await mergeWithExternalPdfs(doc, externalPdfBlobs)
					: doc.output("blob");

			/*const mergedUrl = URL.createObjectURL(pdfBlob);
			const link = document.createElement("a");
			link.href = mergedUrl;
			link.download = `Inspection_RFI_${rfiData.rfi_Id || "Draft"}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);*/
			// 4️⃣ Upload PDF to backend


			if (!isEngineer) {




				const confirmed = await showConfirmationModal(
					"I hereby confirm that the information submitted in this RFI is accurate and complete to the best of my knowledge. I authorize the use of my E-Sign solely from identity verification (KYC) for submission authentication."
				);

				if (!confirmed) {
					alert("Submission cancelled.");
					setIsSubmitting(false);
					return; // Stop further execution
				}

				const pdfFormData = new FormData();
				pdfFormData.append("pdf", pdfBlob, `${rfiData?.id}.pdf`);
				pdfFormData.append("rfiId", rfiData?.id);

				const uploadRes = await fetch(`${API_BASE_URL}rfi/uploadPdfContractor`, {
					method: "POST",
					body: pdfFormData,
					credentials: "include",
				});

				if (!uploadRes.ok) {
					throw new Error("Failed to upload PDF");
				}

				console.log("? PDF uploaded successfully");

				const formData1 = new FormData();
				formData1.append("rfiId", rfiData?.id);
				formData1.append("txnId", generateUniqueTxnId());

				const stampRes = await fetch(`${API_BASE_URL}rfi/stampPdfFromXml`, {
					method: "POST",
					body: formData1,
					credentials: "include",
				});

				if (!stampRes.ok) {
					const errorText = await stampRes.text();
					throw new Error("Stamping failed: " + errorText);
				}

				console.log("Stamping successful");

				try {
					const resCon = await fetch(`${API_BASE_URL}rfi/finalSubmit`, {
						method: "POST",
						body: formData,
						credentials: "include",
					});

					if (!resCon.ok) {
						throw new Error(await resCon.text());
					}

					setInspectionStatusMode("SUBMITTED");
					localStorage.setItem(`inspectionLocked_${rfiData.id}`, "true");
					setIsSubmitting(false);

					await new Promise((resolve) => {
						alert("Contractor eSign completed successfully.");
						resolve();
					});

					navigate("/inspection");

				} catch (err) {
					console.error(err);
					disconnectEsignSocket();
					alert(`? ${err.message}`);
					setIsSubmitting(false);
				}


			}

			else {


				try {
					const confirmed = await showConfirmationModal(
						"I hereby confirm that the information submitted in this RFI is accurate and complete to the best of my knowledge. I authorize the use of my E-Sign solely from identity verification (KYC) for submission authentication."
					);

					if (!confirmed) {
						alert("Submission cancelled.");
						setIsSubmitting(false);
						return; // stop further execution
					}

					const pdfFormData = new FormData();
					pdfFormData.append("inspectionStatus", (testInLab || "").trim());
					pdfFormData.append("engineerRemarks", engineerRemarks || "");
					pdfFormData.append("pdf", pdfBlob, `${rfiData?.id}.pdf`);
					pdfFormData.append("rfiId", rfiData?.id);

					const uploadRes = await fetch(`${API_BASE_URL}rfi/rfi/uploadPdf/Engg`, {
						method: "POST",
						body: pdfFormData,
						credentials: "include",
					});

					if (!uploadRes.ok) throw new Error("Failed to upload PDF");
					console.log("? PDF uploaded successfully");

					const formData1 = new FormData();
					formData1.append("rfiId", rfiData?.id);

					const stampRes = await fetch(`${API_BASE_URL}rfi/stampEnggPdfFromXml`, {
						method: "POST",
						body: formData1,
						credentials: "include",
					});

					const stampData = await stampRes.json();
					if (!stampRes.ok || stampData.status === "error") {
						throw new Error(`Stamping failed: ${stampData.message || "Unknown error"}`);
					}
					console.log("? Stamping successful");

					const resEngg = await fetch(`${API_BASE_URL}rfi/finalSubmit`, {
						method: "POST",
						body: formData,
						credentials: "include",
					});

					if (!resEngg.ok) {
						const errText = await resEngg.text();
						throw new Error(`? Submission failed: ${errText}`);
					}

					setInspectionStatusMode("SUBMITTED");
					setIsSubmitting(false);
					localStorage.setItem(`inspectionLocked_${rfiData.id}`, "true");
					alert("Engineer eSign completed successfully.");
					navigate("/inspection");

				} catch (err) {
					console.error(err);
					disconnectEsignSocket();
					alert(err.message);
					setIsSubmitting(false);
				}


			}





		} catch (err) {
			console.error("❌ Submission failed:", err);
			alert(`Submission failed: ${err.message}`);
			setIsSubmitting(false);
		}
	};

	function showConfirmationModal(message) {
		return new Promise((resolve) => {
			// Create modal elements
			const modal = document.createElement("div");
			modal.style.position = "fixed";
			modal.style.top = "0";
			modal.style.left = "0";
			modal.style.width = "100%";
			modal.style.height = "100%";
			modal.style.backgroundColor = "rgba(0,0,0,0.5)";
			modal.style.display = "flex";
			modal.style.alignItems = "center";
			modal.style.justifyContent = "center";
			modal.style.zIndex = "9999";

			const popup = document.createElement("div");
			popup.style.backgroundColor = "#fff";
			popup.style.padding = "20px";
			popup.style.borderRadius = "8px";
			popup.style.width = "500px";
			popup.style.textAlign = "left";

			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = "confirmationCheck";

			const label = document.createElement("label");
			label.htmlFor = "confirmationCheck";
			label.innerText = message;
			label.style.marginLeft = "10px";

			const btnDiv = document.createElement("div");
			btnDiv.style.marginTop = "20px";
			btnDiv.style.textAlign = "right";

			const btnOk = document.createElement("button");
			btnOk.innerText = "Confirm";
			btnOk.disabled = true;
			btnOk.style.marginRight = "10px";

			const btnCancel = document.createElement("button");
			btnCancel.innerText = "Cancel";

			btnDiv.appendChild(btnOk);
			btnDiv.appendChild(btnCancel);
			popup.appendChild(checkbox);
			popup.appendChild(label);
			popup.appendChild(btnDiv);
			modal.appendChild(popup);
			document.body.appendChild(modal);

			checkbox.addEventListener("change", () => {
				btnOk.disabled = !checkbox.checked;
			});

			btnOk.addEventListener("click", () => {
				document.body.removeChild(modal);
				resolve(true);
			});

			btnCancel.addEventListener("click", () => {
				document.body.removeChild(modal);
				resolve(false);
			});
		});
	}
	useEffect(() => {
		if (id && localStorage.getItem(`inspectionLocked_${id}`) === "true") {
			setInspectionStatusMode("SUBMITTED");
		} else {
			setInspectionStatusMode("DRAFT");
		}
	}, [id]);

	useEffect(() => {
		if (!rfiData?.id) return;

		const fetchInspections = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}rfi/inspections/${rfiData.id}`, {
					credentials: "include"
				});
				if (!res.ok) throw new Error(await res.text());

				const data = await res.json();
				if (data.length > 0) {
					const latestInspection = data[data.length - 1];
					console.log("Latest inspection:", latestInspection);


					setLocationText(latestInspection.location || "");
					setChainage(latestInspection.chainage || "");


					// ✅ measurements now comes from `latestInspection.measurements`
					if (latestInspection.measurements) {
						console.log("Raw measurement object:", latestInspection.measurements);
						const m = latestInspection.measurements;

						// ⭐ Add this block to register unit if not in predefined list
						const unitFromBackend = m.units;
						const typeFromBackend = m.measurementType;

						if (unitFromBackend && typeFromBackend) {
							const isNotBase =
								!baseUnits[typeFromBackend]?.includes(unitFromBackend);

							const isNotCustom =
								!customUnits[typeFromBackend]?.includes(unitFromBackend);

							if (isNotBase && isNotCustom) {
								setCustomUnits(prev => ({
									...prev,
									[typeFromBackend]: [...prev[typeFromBackend], unitFromBackend]
								}));
							}
						}
						console.log("Measurement object:", m);
						console.log("Measurement unit from backend:", m.unit);

						setMeasurements([{
							type: m.measurementType || "",
							L: m.l || "",
							B: m.b || "",
							H: m.h || "",
							weight: m.weight || "",
							units: m.units || "",
							No: m.no || "",
							total: m.totalQty || ""
						}]);
					}
					else {
						setMeasurements([]);
					}

					setSelfieImage(latestInspection.selfiePath || null);
					//					setGalleryImages(
					//						latestInspection.siteImage
					//							? latestInspection.siteImage.split(",").map(img => img.trim())
					//							: []
					//					);
					setTestReportFile(latestInspection.testSiteDocuments || null);
					setInspectionStatus(latestInspection.inspectionStatus || null);
					setTestInLab(latestInspection.testInsiteLab || null);
					setEngineerRemarks(latestInspection.engineerRemarks || "");
					setOverallComments(latestInspection.descriptionEnclosure || "");
					setSupportingFiles(latestInspection.supportingFiles || []);
					setSupportingDescriptions(latestInspection.supportingDescriptions || []);


				}
			} catch (err) {
				console.error("Failed to fetch inspections:", err);
			}
		};

		fetchInspections();
	}, [rfiData?.id]);

	const [completedOfflineInspections, setCompletedOfflineInspections] = useState({});

	const syncOfflineInspections = async () => {
		if (!navigator.onLine) return;

		// ✅ Sync inspection images first
		const offlineInspections = await getAllOfflineInspections();
		for (const inspection of offlineInspections) {
			try {
				const formData = new FormData();
				formData.append("data", JSON.stringify({ rfiId: inspection.rfiId }));

				// Selfie
				if (inspection.selfieImage) {
					formData.append("selfie", inspection.selfieImage instanceof File
						? inspection.selfieImage
						: dataURLtoFile(inspection.selfieImage, "selfie.jpg"));
				}

				// Site Images
				inspection.galleryImages?.forEach((img, i) => {
					if (img) formData.append("siteImages", img instanceof File ? img : dataURLtoFile(img, `siteImage${i + 1}.jpg`));
				});

				// Test Report
				if (inspection.testReportFile) {
					formData.append("testReport", inspection.testReportFile);
				}

				const res = await fetch(`${API_BASE_URL}rfi/saveDraft`, {
					method: "POST",
					body: formData,
					credentials: "include"
				});

				if (!res.ok) {
					console.error(`❌ Failed to sync inspection ${inspection.rfiId}`);
					continue;
				}

				console.log(`✅ Synced inspection ${inspection.rfiId}`);

				const completed = JSON.parse(localStorage.getItem("completedOfflineInspections") || "{}");
				completed[inspection.rfiId] = true;
				localStorage.setItem("completedOfflineInspections", JSON.stringify(completed));

				/*				await removeOfflineInspection(inspection.inspectionId);
				*/
			} catch (err) {
				console.error(`⚠️ Failed to sync inspection ${inspection.rfiId}:`, err);
			}
		}

		const offlineEnclosures = await getAllOfflineEnclosures();
		for (const enclosure of offlineEnclosures) {
			try {
				const enclosureForm = new FormData();
				enclosureForm.append('rfiId', enclosure.rfiId);
				enclosureForm.append('file', enclosure.file);
				enclosureForm.append('enclosureName', enclosure.enclosureName);

				const res = await fetch(`${API_BASE_URL}rfi/upload`, {
					method: 'POST',
					body: enclosureForm,
					credentials: 'include'
				});

				if (!res.ok) {
					console.error(`❌ Failed to sync enclosure ${enclosure.enclosureName}`);
					continue;
				}



				console.log(`📂 Synced enclosure ${enclosure.enclosureName}`);
			} catch (err) {
				console.error(`⚠️ Failed to sync enclosure ${enclosure.enclosureName}:`, err);
			}
		}

		/*		offlineEnclosures.forEach(e => clearOfflineEnclosures(e.rfiId));
		*/

	};


	const [isOffline, setIsOffline] = useState(false);



	useEffect(() => {
		window.addEventListener("online", syncOfflineInspections);
		return () => window.removeEventListener("online", syncOfflineInspections);
	}, []);

	const generateUniqueTxnId = () => {
		const timestamp = Date.now();
		const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
		return `${timestamp}${randomSuffix}`;
	};

	const fetchUpdatedRfiData = async (id) => {
		try {
			const res = await fetch(`${API_BASE_URL}rfi/rfi-details/${id}`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to fetch updated RFI data");
			const data = await res.json();
			setRfiData(data);
		} catch (err) {
			console.error("Error refreshing RFI data:", err);
		}
	};



	const handleSiteImageUpload = async (file, rfiId) => {
		if (!file) {
			alert("⚠️ Please capture or select an image before uploading.");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("siteImage", file);
			formData.append("RfiId", rfiId);

			const response = await fetch(`${API_BASE_URL}rfi/inspection/uploadSiteImage`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const resultText = await response.text();

			if (!response.ok) throw new Error(resultText || "Upload failed");

			alert(resultText);
			console.log("Upload result:", resultText);

			// ✅ Re-fetch updated inspection details
			await fetchUpdatedRfiData(rfiId);

		} catch (error) {
			console.error("Upload error:", error);
			alert("❌ Failed to upload image. Please try again.");
		}
	};

	const validateEnclosures = () => {
		if (!Array.isArray(enclosuresData) || enclosuresData.length === 0) {
			alert("⚠️ No enclosures found — please contact admin.");
			return false;
		}

		for (const e of enclosuresData) {
			const enclosureFile = rfiData.enclosure?.find(
				enc =>
					enc.enclosureName?.trim().toLowerCase() === e.enclosure?.trim().toLowerCase()
			)?.enclosureUploadFile;

			const checklistDone = enclosureStates[e.id]?.checklistDone;

			if (!enclosureFile && !checklistDone) {
				alert(`⚠️ Please complete enclosure "${e.enclosure}" — upload file or finish checklist.`);
				return false;
			}
		}

		return true;
	};



	useEffect(() => {
		return () => {
			if (siteImage) URL.revokeObjectURL(siteImage);
		};
	}, [siteImage]);

	const base64ToFile = (base64String, fileName) => {
		const arr = base64String.split(',');
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], fileName, { type: mime });
	};

	useEffect(() => {
		if (!measurements || measurements.length === 0) {
			setMeasurements([{ type: "", units: "", L: "", B: "", H: "", No: "", total: "" }]);
		}
	}, [measurements]);



	if (!rfiData)
		return <div>Loading RFI details...</div>;

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
										<input type="text" value={rfiData?.inspectionDetails?.[rfiData.inspectionDetails.length - 1]?.chainage} onChange={e => setChainage(e.target.value)} />
									</div>
									<div className="upload-section">
										<label>Selfie <span class="red">*</span>:</label>
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
										<label>Location <span class="red">*</span>:</label>
										<input value={locationText} onFocus={fetchLocation} onChange={e => setLocationText(e.target.value)}
											disabled={getDisabled()}
										/>
										{errors.location && <p className="error-text">{errors.location}</p>}
										<label>Date of Inspection:</label>
										<input type="date" value={dateOfInspection} onChange={e => setDateOfInspection(e.target.value)} readOnly />
										<label>Time of Inspection:</label>
										<input type="time" value={timeOfInspection} onChange={e => setTimeOfInspection(e.target.value)} readOnly />
										<label>Contractor's Representative:</label>
										<input type="text" value={contractorRep} onChange={e => setContractorRep(e.target.value)} readOnly />
									</div>
									<div className="upload-section-site">
										<label>
											Upload Site Image
										</label>

										{!siteImage ? (
											<>
												{/* Capture Image Button */}
												<button
													className="upload-section-site-button-cam"
													onClick={() => {
														setCameraMode('environment');
														setShowCamera('gallery-0');
													}}
													disabled={getDisabled()}
												>
													<img src="/images/camera_icon.png" alt="Camera" className="camera-icon" />
												</button>


												<div style={{ marginTop: '-20px', marginLeft: '25px' }}>
													<label
														style={{
															display: 'inline-flex',
															alignItems: 'center',
															gap: '6px',
															cursor: 'pointer',
														}}
													>
														<img
															src="/images/folder-icon.png"
															alt="Folder"
															className="folder-icon"
														/>
														<span>Choose File</span>
														<input
															type="file"
															name="siteImage"
															accept="image/*"
															onChange={e => {
																const file = e.target.files?.[0];
																if (file && file.type.startsWith('image/')) {
																	const previewUrl = URL.createObjectURL(file);
																	setGalleryImages([file]);
																	setSiteImage(previewUrl);
																} else {
																	console.warn('Invalid file selected');
																}
															}}
															disabled={getDisabled()}
															style={{ display: 'none' }}
														/>
													</label>
												</div>


											</>
										) : (
											<>
												<img
													src={siteImage}
													alt="Preview"
													className="site-image-preview"
												/>

												<div className="action-buttons" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
													<button
														onClick={() => {
															setGalleryImages([]);
															setSiteImage(null);
														}}
														className="red-button-site"
														disabled={getDisabled()}
													>
														❌
													</button>

													<button
														className='upload-site'
														onClick={async () => {
															try {
																setUploading(true);
																if (galleryImages[0] && rfiData?.id) {
																	await handleSiteImageUpload(galleryImages[0], rfiData.id);
																	console.log('Upload successful');
																	setGalleryImages([]);
																	setSiteImage(null);
																} else {
																	console.warn('Missing image or RFI ID');
																}
															} catch (err) {
																console.error('Upload failed:', err);
															} finally {
																setUploading(false);
															}
														}}
														disabled={getDisabled() || !rfiData?.id || !galleryImages[0]}
													>
														{uploading ? '⏳' : '⬆️ '}
													</button>
												</div>
											</>
										)}
									</div>

								</div>


								<div className="measurements-section">
									<h3 className="section-title">Site Images Uploaded</h3>
									<div className="confirm-inspection w-100"
										style={{
											marginTop: "1rem",
											padding: "12px",
											border: "1px solid #ddd",
											borderRadius: "8px",
										}}
									>
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
												textAlign: "left",
											}}
										>
											<tbody>
												{/* Contractor Images */}
												<tr>
													<td
														style={{
															padding: "8px",
															borderBottom: "1px solid #eee",
															width: "25%",
															verticalAlign: "top",
														}}
													>
														Contractor Site Images
													</td>
													<td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
														{Array.isArray(rfiData?.inspectionDetails) &&
															rfiData.inspectionDetails.some(
																(d) => d.uploadedBy === "CON" && d.siteImage
															) ? (
															<div
																style={{
																	display: "flex",
																	flexWrap: "wrap",
																	gap: "10px",
																	alignItems: "center",
																}}
															>
																{rfiData.inspectionDetails
																	.filter((d) => d.uploadedBy === "CON" && d.siteImage)
																	.flatMap((d) => d.siteImage.split(","))
																	.map((imgPath, index) => {
																		const encodedPath = encodeURIComponent(imgPath.trim());
																		const imageUrl = `${API_BASE_URL}api/validation/previewFiles?filepath=${encodedPath}`;
																		return (
																			<a
																				key={index}
																				href={imageUrl}
																				target="_blank"
																				rel="noopener noreferrer"
																				style={{
																					display: "inline-block",
																					border: "1px solid #ccc",
																					borderRadius: "6px",
																					overflow: "hidden",
																					width: "100px",
																					height: "100px",
																					cursor: "pointer",
																				}}
																			>
																				<img
																					src={imageUrl}
																					alt={`Contractor Image ${index + 1}`}
																					style={{
																						width: "100%",
																						height: "100%",
																						objectFit: "cover",
																					}}
																				/>
																			</a>
																		);
																	})}
															</div>
														) : (
															<span style={{ color: "#888" }}>No images uploaded</span>
														)}
													</td>
												</tr>

												{/* Engineer Images */}
												<tr>
													<td
														style={{
															padding: "8px",
															width: "25%",
															verticalAlign: "top",
														}}
													>
														Engineer Site Images
													</td>
													<td style={{ padding: "8px" }}>
														{Array.isArray(rfiData?.inspectionDetails) &&
															rfiData.inspectionDetails.some(
																(d) => d.uploadedBy === "Engg" && d.siteImage
															) ? (
															<div
																style={{
																	display: "flex",
																	flexWrap: "wrap",
																	gap: "10px",
																	alignItems: "center",
																}}
															>
																{rfiData.inspectionDetails
																	.filter((d) => d.uploadedBy === "Engg" && d.siteImage)
																	.flatMap((d) => d.siteImage.split(","))
																	.map((imgPath, index) => {
																		const encodedPath = encodeURIComponent(imgPath.trim());
																		const imageUrl = `${API_BASE_URL}api/validation/previewFiles?filepath=${encodedPath}`;
																		return (
																			<a
																				key={index}
																				href={imageUrl}
																				target="_blank"
																				rel="noopener noreferrer"
																				style={{
																					display: "inline-block",
																					border: "1px solid #ccc",
																					borderRadius: "6px",
																					overflow: "hidden",
																					width: "100px",
																					height: "100px",
																					cursor: "pointer",
																				}}
																			>
																				<img
																					src={imageUrl}
																					alt={`Engineer Image ${index + 1}`}
																					style={{
																						width: "100%",
																						height: "100%",
																						objectFit: "cover",
																					}}
																				/>
																			</a>
																		);
																	})}
															</div>
														) : (
															<span style={{ color: "#888" }}>No images uploaded</span>
														)}
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>



								<div className="measurements-section">
									<h3 className="section-title">Enclosures <span class="red">*</span></h3>
									{/*<table className="measurements-table">
										<thead>
											<tr>
												<th>RFI Description</th>
												<th>Enclosure</th>
												<th>Action</th>
												<th>Uploaded</th>
												<th>Test Report</th>
											</tr>
										</thead>
										<tbody>
											{enclosuresData.map((e, index) => {
												const state = enclosureStates[e.id] || {};
												const rfiReportFilepath = rfiData.inspectionDetails?.[0]?.testSiteDocuments || '';

												const enclosureFile = rfiData.enclosure?.find(enc =>
													enc.enclosureName?.trim().toLowerCase() === e.enclosure?.trim().toLowerCase()
												)?.enclosureUploadFile;

												return (
													<tr key={e.id}>
														<td>{e.rfiDescription}</td>
														<td>{e.enclosure}</td>

														<td className='enclouse-open-upload'>
															{enclosureActions[e.id] === 'UPLOAD' ? (
																<button
																	className="hover-blue-btn"
																	onClick={() => setUploadPopup(e.id)}
																	disabled={getDisabled()}
																>
																	Upload
																</button>
															) : (
																<>
																	{deptFK?.toLowerCase() === "engg" ? (
																		<>
																			<button
																				className="hover-blue-btn"
																				onClick={() => setChecklistPopup(e.id)}
																			>
																				{engineerSubmitted
																					? 'View'
																					: (enclosureStates[e.id]?.checklistDone ? 'Edit' : 'Open')}
																			</button>
																			<button
																				className="hover-blue-btn"
																				onClick={() => setUploadPopup(e.id)}
																				disabled={getDisabled()}
																			>
																				Upload
																			</button>
																		</>
																	) : (
																		<>
																			<button
																				className="hover-blue-btn"
																				onClick={() => setChecklistPopup(e.id)}
																			>
																				{contractorSubmitted
																					? 'View'
																					: (enclosureStates[e.id]?.checklistDone ? 'Edit' : 'Open')}
																			</button>
																			<button
																				className="hover-blue-btn"
																				onClick={() => setUploadPopup(e.id)}
																				disabled={getDisabled()}
																			>
																				Upload
																			</button>
																		</>
																	)}
																</>
															)}
														</td>
														<td>
															{enclosureFile ? (
																<>
																	{ DOWNLOAD BUTTON }
																	<button
																		className="hover-blue-btn"
																		onClick={() => {
																			const url = `${API_BASE_URL.replace(/\/$/, '')}/api/rfi/DownloadEnclosure?rfiId=${rfiData.id}&enclosureName=${encodeURIComponent(e.enclosure)}`;

																			fetch(url)
																				.then((response) => {
																					if (!response.ok) throw new Error('Download failed');
																					return response.blob();
																				})
																				.then((blob) => {
																					const blobUrl = window.URL.createObjectURL(blob);
																					const link = document.createElement('a');
																					link.href = blobUrl;
																					link.download = `{${rfiData.rfi_Id}}-{${e.rfiDescription}}-{${e.enclosure}}.pdf`;
																					document.body.appendChild(link);
																					link.click();
																					link.remove();
																					window.URL.revokeObjectURL(blobUrl);
																				})
																				.catch(() => alert('❌ Unable to download file.'));
																		}}
																	>
																		Download
																	</button>

																	{ DELETE BUTTON }
																	<button
																		className="hover-red-btn"
																		disabled={getDisabled()}
																		onClick={async () => {
																			if (!window.confirm(`Delete all uploaded files under ${e.enclosure}?`)) return;

																			try {
																				const res = await fetch(
																					`${API_BASE_URL}rfi/enclosure/files?rfiId=${rfiData.id}&enclosureName=${encodeURIComponent(e.enclosure)}`,
																					{ method: "DELETE", credentials: "include" }
																				);

																				if (!res.ok) {
																					const txt = await res.text().catch(() => "");
																					throw new Error(txt || "Delete failed");
																				}

																				alert("Files deleted successfully");

																				// ⭐ UPDATE FRONTEND IMMEDIATELY — NO PAGE REFRESH ⭐
																				setRfiData(prev => ({
																					...prev,
																					enclosure: prev.enclosure?.map(enc =>
																						enc.enclosureName?.trim().toLowerCase() === e.enclosure?.trim().toLowerCase()
																							? { ...enc, enclosureUploadFile: null }
																							: enc
																					)
																				}));

																			} catch (err) {
																				console.error(err);
																				alert("Error deleting files");
																			}
																		}}
																		style={{ marginLeft: "8px" }}
																	>
																		Remove
																	</button>

																</>
															) : (
																'---'
															)}

														</td>


														{index === 0 && (
															<td rowSpan={enclosuresData.length}>
																{rfiReportFilepath ? (
																	<button
																		type="button"
																		className="hover-blue-btn"
																		onClick={() => {
																			const sanitizedBase = API_BASE_URL.replace(/\/$/, '');
																			const encodedPath = encodeURIComponent(rfiReportFilepath);
																			const downloadUrl = `${sanitizedBase}/rfi/DownloadPrev?filepath=${encodedPath}`;
																			const filename = rfiReportFilepath.split(/[\\/]/).pop();

																			const link = document.createElement('a');
																			link.href = downloadUrl;
																			link.download = filename || 'report.pdf';
																			document.body.appendChild(link);
																			link.click();
																			document.body.removeChild(link);
																		}}
																	>
																		Download
																	</button>
																) : (
																	'---'
																)}
															</td>
														)}

													</tr>
												);
											})}
										</tbody>
									</table>*/}


									<table className="measurements-table">
										<thead>
											<tr>
												<th>RFI Description</th>
												<th>Enclosure</th>
												<th>Action</th>
												<th>Uploaded</th>
												<th>Test Report</th>
											</tr>
										</thead>
										<tbody>
											{enclosuresData.map((e, index) => {
												const files = rfiData.enclosure?.filter(
													(enc) => enc.enclosureName?.trim().toLowerCase() === e.enclosure?.trim().toLowerCase()
												) || [];

												const rfiReportFilepath = rfiData.inspectionDetails?.[0]?.testSiteDocuments || '';

												return (
													<tr key={e.id}>
														<td>{e.rfiDescription}</td>
														<td>{e.enclosure}</td>

														{/* Upload/Open buttons */}
														<td>
															{enclosureActions[e.id] === 'UPLOAD' ? (
																<button
																	className="hover-blue-btn"
																	onClick={() => setUploadPopup(e.id)}
																	disabled={getDisabled()}
																>
																	Upload
																</button>
															) : (
																<>
																	<button
																		className="hover-blue-btn"
																		onClick={() => setChecklistPopup(e.id)}
																	>
																		{deptFK?.toLowerCase() === "engg"
																			? (files.some(f => f.uploadedBy === "Engg") ? "View" : "Open")
																			: (files.some(f => f.uploadedBy === "CON") ? "View" : "Open")}
																	</button>

																	<button
																		className="hover-blue-btn"
																		onClick={() => setUploadPopup(e.id)}
																		disabled={getDisabled()}
																	>
																		Upload
																	</button>
																</>
															)}
														</td>

														{/* Download and Remove buttons */}
														<td>
															{files.length > 0 ? (
																files.map((file) => (

																	<div key={file.id} style={{ display: "flex", gap: "5px" }}>
																		{/* Download button */}
																		<button
																			className="hover-blue-btn"
																			onClick={() => {
																				const url = `${API_BASE_URL}api/rfi/DownloadEnclosure?rfiId=${rfiData.id}&enclosureName=${encodeURIComponent(file.enclosureName)}&uploadedBy=${file.uploadedBy}`;
																				fetch(url)
																					.then((res) => res.blob())
																					.then((blob) => {
																						const blobUrl = window.URL.createObjectURL(blob);
																						const link = document.createElement("a");
																						link.href = blobUrl;
																						link.download = `${rfiData.rfi_Id}-${file.enclosureName}.pdf`;
																						document.body.appendChild(link);
																						link.click();
																						link.remove();
																					});
																			}}
																		>
																			Download
																		</button>

																		<button
																			className="hover-red-btn"
																			disabled={getDisabled()}
																			onClick={async () => {
																				// Normalize and map roles
																				let currentDeptNormalized = deptFK?.trim().toUpperCase();
																				if (currentDeptNormalized === "CONTRACTOR") currentDeptNormalized = "CON";
																				if (currentDeptNormalized === "ENGG") currentDeptNormalized = "ENGG";

																				const fileOwnerNormalized = file.uploadedBy?.trim().toUpperCase();

																				console.log("DEBUG: normalized deptFK:", currentDeptNormalized);
																				console.log("DEBUG: normalized file uploadedBy:", fileOwnerNormalized);

																				if (currentDeptNormalized !== fileOwnerNormalized) {
																					alert(`❌ You cannot delete files uploaded by ${file.uploadedBy}.`);
																					return;
																				}

																				if (!window.confirm(`Delete  uploaded file under ${e.enclosure}?`)) return;

																				try {
																					const res = await fetch(
																						`${API_BASE_URL}rfi/enclosure/files?id=${file.id}`,
																						{ method: "DELETE", credentials: "include" }
																					);

																					if (!res.ok) {
																						const txt = await res.text().catch(() => "");
																						throw new Error(txt || "Delete failed");
																					}

																					alert("Files deleted successfully");

																					setRfiData((prev) => ({
																						...prev,
																						enclosure: prev.enclosure?.filter((f) => f.id !== file.id),
																					}));
																				} catch (err) {
																					console.error(err);
																					alert("Error deleting files");
																				}
																			}}
																		>
																			Remove
																		</button>



																	</div>
																))
															) : (
																"---"
															)}
														</td>



														{/* Test Report */}
														{index === 0 && (
															<td rowSpan={enclosuresData.length}>
																{rfiReportFilepath ? (
																	<button
																		type="button"
																		className="hover-blue-btn"
																		onClick={() => {
																			const downloadUrl = `${API_BASE_URL}/rfi/DownloadPrev?filepath=${encodeURIComponent(rfiReportFilepath)}`;
																			const link = document.createElement("a");
																			link.href = downloadUrl;
																			link.download = 'report.pdf';
																			document.body.appendChild(link);
																			link.click();
																			document.body.removeChild(link);
																		}}
																	>
																		Download
																	</button>
																) : (
																	"---"
																)}
															</td>
														)}
													</tr>
												);
											})}
										</tbody>
									</table>



									{/* Supporting Documents Section */}
									{/* Supporting Documents Upload Section */}
									<div className="supporting-documents-upload" style={{ marginTop: "20px" }}>
										<label className="upload-label" style={{ fontWeight: "600" }}>
											Supporting Documents
										</label>

										{/* Upload button */}
										<button
											className="hover-blue-btn"
											style={{ marginLeft: "10px" }}
											onClick={() => setSupportingUploadPopup(true)}
											disabled={getDisabled()}
										>
											Upload
										</button>

										{/* Display files */}
										{(supportingFiles.length > 0 || supportingDocs.length > 0) && (
											<ul style={{ marginTop: "10px" }}>

												{/* Backend files */}
												{supportingFiles.map((fileUrl, idx) => {
													const fileName = fileUrl.split("/").pop(); // extract filename
													const downloadUrl = `${API_BASE_URL}rfi/supporting-doc/download?rfiId=${rfiData.id}&fileName=${encodeURIComponent(fileName)}`;
													const viewUrl = `${API_BASE_URL}rfi/supporting-docs/${encodeURIComponent(fileName)}`; // inline view

													return (
														<li key={`backend-${idx}`} style={{ marginBottom: "10px" }}>
															<span>{supportingDescriptions[idx] || `File ${idx + 1}`}</span>

															{/* View */}
															<button
																className="hover-green-btn"
																style={{ marginLeft: "10px" }}
																onClick={() => window.open(viewUrl, "_blank")}
															>
																View
															</button>

															{/* Download */}
															<button
																className="hover-blue-btn"
																style={{ marginLeft: "8px" }}
																onClick={async () => {
																	try {
																		const res = await fetch(downloadUrl, { credentials: "include" });
																		if (!res.ok) throw new Error("File not found");
																		const blob = await res.blob();
																		const link = document.createElement("a");
																		link.href = window.URL.createObjectURL(blob);
																		link.download = fileName;
																		document.body.appendChild(link);
																		link.click();
																		document.body.removeChild(link);
																		window.URL.revokeObjectURL(link.href);
																	} catch (err) {
																		console.error(err);
																		alert("Download failed");
																	}
																}}
															>
																Download
															</button>

															{/* Remove */}
															<button
																className="hover-red-btn"
																disabled={getDisabled()}
																style={{ marginLeft: "8px" }}
																onClick={async () => {
																	try {
																		const res = await fetch(
																			`${API_BASE_URL}rfi/inspection/${rfiData.id}/supporting-doc?fileName=${encodeURIComponent(fileName)}`,
																			{ method: "DELETE", credentials: "include" }
																		);
																		if (!res.ok) throw new Error(await res.text());
																		setSupportingFiles(prev => prev.filter((_, i) => i !== idx));
																		setSupportingDescriptions(prev => prev.filter((_, i) => i !== idx));
																		alert("File removed successfully!");
																	} catch (err) {
																		console.error("Failed to remove file:", err);
																		alert("Failed to remove file");
																	}
																}}
															>
																Remove
															</button>
														</li>
													);
												})}

												{/* Newly uploaded files */}
												{supportingDocs.map((docObj, idx) => (
													<li key={`new-${idx}`} style={{ marginBottom: "10px" }}>
														<input
															type="text"
															placeholder="Enter description"
															value={docObj.description}
															onChange={(e) => {
																const newDocs = [...supportingDocs];
																newDocs[idx].description = e.target.value;
																setSupportingDocs(newDocs);
															}}
															style={{ marginRight: "10px", width: "250px" }}
														/>
														<button
															className="hover-green-btn"
															style={{ marginRight: "8px" }}
															onClick={() => window.open(URL.createObjectURL(docObj.file), "_blank")}
														>
															View
														</button>
														<button
															className="hover-blue-btn"
															style={{ marginRight: "8px" }}
															onClick={() => {
																const link = document.createElement("a");
																link.href = URL.createObjectURL(docObj.file);
																link.download = docObj.file.name || "supporting_document";
																link.click();
															}}
														>
															Download
														</button>
														<button
															className="hover-red-btn"
															onClick={() => setSupportingDocs(prev => prev.filter((_, i) => i !== idx))}
															disabled={getDisabled()}
														>
															Remove
														</button>
													</li>
												))}
											</ul>
										)}

										{/* Upload popup */}
										{supportingUploadPopup && (
											<UploadPopup
												onClose={() => setSupportingUploadPopup(false)}
												onSubmit={(file) => {
													setSupportingDocs(prev => [...prev, { file, description: "" }]);
													setSupportingUploadPopup(false);
												}}
											/>
										)}
									</div>


									{/* ✅ Description box below the table */}
									<div className="enclosure-comments">
										<label htmlFor="enclosureComments">Description</label>
										<textarea
											id="enclosureComments"
											placeholder="Enter your comments here"
											value={overallComments}
											onChange={(e) => setOverallComments(e.target.value)}
											className="comments-textarea"
											rows={4}
											disabled={getDisabled()}
										></textarea>
									</div>

								</div>

								{/* ✅ Measurements Section */}
								<hr className="section-divider" />

								<div className="measurements-section">
									<h3 className="section-title">
										Measurements <span className="red">*</span>
									</h3>

									{errors.measurements && (
										<p className="error-text">{errors.measurements}</p>
									)}

									<table className="measurements-table">
										<thead>
											<tr>
												<th>Type of Measurement</th>
												<th>Units</th>
												<th>L</th>
												<th>B</th>
												<th>H</th>
												<th>Weight</th>
												<th>No.</th>
												<th>Total Qty</th>
											</tr>
										</thead>

										<tbody>
											{Array.isArray(measurements) && measurements.length > 0 ? (
												measurements.map((row, index) => {
													const unitsOptions = row.type
														? [
															...baseUnits[row.type],
															...(customUnits[row.type] || [])
														]
														: [];

													return (
														<tr key={index}>
															{/* Type */}
															<td>
																<select
																	className="measurement-input"
																	value={row.type || ""}
																	onChange={(e) =>
																		handleMeasurementChange(
																			index,
																			"type",
																			e.target.value
																		)
																	}
																	disabled={getDisabled()}
																>
																	<option value="">Select</option>
																	<option value="Area">Area</option>
																	<option value="Length">Length</option>
																	<option value="Volume">Volume</option>
																	<option value="Number">Number</option>
																	<option value="Weight">Weight</option>
																</select>
															</td>

															{/* Units */}
															<td>
																<select
																	className="measurement-input"
																	value={row.units || ""}
																	onChange={(e) => {
																		if (e.target.value === "custom") {
																			const newUnit = prompt(
																				"Enter your custom unit:"
																			);

																			if (newUnit?.trim()) {
																				// Update row
																				handleMeasurementChange(
																					index,
																					"units",
																					newUnit
																				);

																				// Save globally
																				setCustomUnits((prev) => ({
																					...prev,
																					[row.type]: [
																						...prev[row.type],
																						newUnit
																					]
																				}));
																			}
																		} else {
																			handleMeasurementChange(
																				index,
																				"units",
																				e.target.value
																			);
																		}
																	}}
																	disabled={!row.type || getDisabled()}
																>
																	<option value="">Select Unit</option>

																	{unitsOptions.map((unit) => (
																		<option key={unit} value={unit}>
																			{unit}
																		</option>
																	))}

																	<option value="custom">
																		➕ Add Custom Unit
																	</option>
																</select>
															</td>

															{/* L */}
															<td>
																<input
																	type="number"
																	className="measurement-input"
																	value={row.L ?? ""}
																	onChange={(e) =>
																		handleMeasurementChange(
																			index,
																			"L",
																			e.target.value
																		)
																	}
																	disabled={
																		getDisabled() ||
																		row.type === "Number" ||
																		row.type === "Weight"
																	}
																/>
															</td>

															{/* B */}
															<td>
																<input
																	type="number"
																	className="measurement-input"
																	value={row.B ?? ""}
																	onChange={(e) =>
																		handleMeasurementChange(
																			index,
																			"B",
																			e.target.value
																		)
																	}
																	disabled={
																		getDisabled() ||
																		row.type === "Length" ||
																		row.type === "Number" ||
																		row.type === "Weight"
																	}
																/>
															</td>

															{/* H */}
															<td>
																<input
																	type="number"
																	className="measurement-input"
																	value={row.H ?? ""}
																	onChange={(e) =>
																		handleMeasurementChange(
																			index,
																			"H",
																			e.target.value
																		)
																	}
																	disabled={
																		getDisabled() ||
																		row.type === "Area" ||
																		row.type === "Length" ||
																		row.type === "Number" ||
																		row.type === "Weight"
																	}
																/>
															</td>

															{/* Weight */}
															<td>
																<input
																	type="number"
																	className="measurement-input"
																	value={row.weight ?? ""}
																	onChange={(e) =>
																		handleMeasurementChange(
																			index,
																			"weight",
																			e.target.value
																		)
																	}
																	disabled={
																		getDisabled() ||
																		row.type !== "Weight"
																	}
																/>
															</td>

															{/* No */}
															<td>
																<input
																	type="number"
																	className="measurement-input"
																	value={row.No ?? ""}
																	onChange={(e) =>
																		handleMeasurementChange(
																			index,
																			"No",
																			e.target.value
																		)
																	}
																	disabled={getDisabled()}
																/>
															</td>

															{/* Total */}
															<td>
																<input
																	type="number"
																	className="measurement-input readonly-input"
																	value={row.total ?? ""}
																	readOnly
																/>
															</td>
														</tr>
													);
												})
											) : (
												<tr>
													<td
														colSpan="8"
														style={{ textAlign: "center", color: "#888" }}
													>
														No measurements added yet.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
								<div className="measurements-section">
									<h3 className="section-title">Confirm Inspection <spam class="red">*</spam></h3>
									<div
										className="confirm-inspection w-100"
										style={{
											marginTop: "1rem",
											padding: "12px",
											border: "1px solid #ddd",
											borderRadius: 8,
										}}
									>


										<div className="d-flex align-center gap-20">
											{/* ✅ Tests in Site/Lab */}
											<div className="form-fields">
												<label>Tests in Site/Lab</label>
												{deptFK?.toLowerCase() === "engg" ? (
													(() => {
														const contractorInspection = rfiData?.inspectionDetails?.find(
															(d) => d.uploadedBy === "CON"
														);
														const contractorStatus = contractorInspection?.inspectionStatus;

														return (
															<p
																style={{
																	color: contractorStatus ? "green" : "red",
																	border: "2px solid grey",
																	padding: 6,
																	borderRadius: 4,
																	width: "fit-content",
																	margin: 0,
																}}
																disabled={viewMode}
															>
																{contractorStatus && contractorStatus.trim() !== ""
																	? contractorStatus
																	: "Not Uploaded"}
															</p>
														);
													})()
												) : (
													<select
														value={inspectionStatusUserSelection || inspectionStatus || ""}
														onChange={(e) => setInspectionStatusUserSelection(e.target.value)}
														disabled={getDisabled()}
													>
														<option value="" disabled hidden>Select</option>
														<option value="VISUAL">Visual</option>
														<option value="LAB_TEST">Lab Test</option>
														<option value="SITE_TEST">Site Test</option>
													</select>


												)}
											</div>

											{/* ✅ Test Report Upload (for Contractor) */}
											<div className="form-fields">
												{deptFK?.toLowerCase() !== "engg" &&
													(inspectionStatusUserSelection === "LAB_TEST" || inspectionStatusUserSelection === "SITE_TEST") && (
														<>
															<label>Upload Test Report Here</label>
															<input
																type="file"
																onChange={(e) => setTestReportFile(e.target.files[0])}
																disabled={getDisabled()}
															/>
														</>
													)}
											</div>


											{/* ✅ Engineer Section */}
											<div className="form-fields">
												{deptFK?.toLowerCase() === "engg" && (
													<>
														<label>Inspection Status</label>
														<select
															value={testInLab || ""}
															onChange={(e) => {
																const value = e.target.value;
																const conflict = Object.values(enclosureStates).some((enc) =>
																	enc.checklist?.some(
																		(row) =>
																			row.contractorStatus === "YES" &&
																			row.engineerStatus === "NO"
																	)
																);
																if (conflict) {
																	setTestInLab("Rejected");
																	alert(
																		"Checklist mismatch (Contractor=YES, Engineer=NO) → Inspection auto-rejected."
																	);
																	return;
																}
																setTestInLab(value);
															}}
															disabled={getDisabled()}
														>
															<option value="">Select</option>
															<option value="Accepted">Accepted</option>
															<option value="Rejected">Rejected</option>
														</select>

														{testInLab === "Rejected" && (
															<div style={{ position: "relative", width: "100%" }}>
																<label>Remarks <spam className="red">*</spam></label>
																<textarea
																	value={engineerRemarks}
																	onChange={(e) => {
																		if (e.target.value.length <= 1000) {
																			setEngineerRemarks(e.target.value);
																		}
																	}}
																	placeholder="Enter remarks"
																	style={{
																		width: "100%",
																		minHeight: "100px",
																		padding: "10px",
																		boxSizing: "border-box",
																		resize: "vertical",
																	}}
																	disabled={getDisabled()}
																/>
																<div
																	style={{
																		position: "absolute",
																		top: "8px",
																		right: "12px",
																		fontSize: "12px",
																		color:
																			engineerRemarks.length >= 1000 ? "red" : "#888",
																		pointerEvents: "none",
																		backgroundColor: "white",
																		padding: "0 4px",
																		borderRadius: "4px",
																	}}
																>
																	{1000 - (engineerRemarks?.length || 0)} limit
																</div>
															</div>
														)}
													</>
												)}
											</div>
										</div>
									</div>
								</div>


								<div className="btn-row" style={{ marginTop: 12 }}>
									<button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
									<button
										className="btn btn-blue"
										onClick={handleSaveDraft}
										disabled={getDisabled()}
									>
										{isSaving ? "Saving..." : "Save Draft"}
									</button>

									{/*<button
										className="btn btn-green"
										onClick={handleSubmitInspection}
										disabled={getDisabled()}
									>
										{isSubmitting ? "Submitting..." : "Submit"}
									</button>*/}

									<button
										type="button"
										className="btn btn-green"
										onClick={handleSubmitInspection}
										disabled={getDisabled()}
									>
										{isSubmitting ? "Submitting..." : "Submit"}
									</button>


									{/*		{deptFK !== "engg" ? (
										<button
											type="button"
											className="btn btn-green"

											onClick={async () => {
												if (isSubmitting) return;
												setIsSubmitting(true);
												// 1. Generate PDF
												const doc = await generateInspectionPdf({
													rfiId: rfiData?.id,
													project: rfiData?.project,
													contractorRep,
													location: locationText,
													chainage,
													dateOfInspection,
													timeOfInspection,
													inspectionStatus,
												});

												const y = doc.lastAutoTable?.finalY
													? doc.lastAutoTable.finalY + 20
													: 50;

												const pdfBlob = doc.output("blob");

												// 2. Send PDF to backend for saving
												const pdfFormData = new FormData();
												pdfFormData.append("pdf", pdfBlob, `${rfiData?.id}.pdf`);
												pdfFormData.append("rfiId", rfiData?.id);

												try {
													const uploadRes = await fetch(`${API_BASE_URL}rfi/uploadPdf`, {
														method: "POST",
														body: pdfFormData,
														credentials: "include", // ✅ keep consistent
													});

													if (!uploadRes.ok) {
														throw new Error("Failed to upload PDF");
													}
													console.log("PDF saved on server!");

													// 3. Aadhaar eSign flow
													const txnId = generateUniqueTxnId();
													const formData = new FormData();
													formData.append("pdfBlob", pdfBlob);
													formData.append("sc", "Y");
													formData.append("txnId", txnId);
													formData.append("rfiId", rfiData?.id ?? "");

													formData.append("signerName", "Swathi" || "");
													formData.append("contractorName", "M V" || "");
													formData.append("signY", Math.floor(y));

													const res = await fetch(
														`${API_BASE_URL}rfi/getSignedXmlRequest`,
														{
															method: "POST",
															body: formData,
															credentials: "include",
														}
													);
													const response = await res.json();

													// 4. Redirect to CDAC eSign form
													const form = document.createElement("form");
													form.method = "POST";
													form.action =
														"https://es-staging.cdac.in/esignlevel2/2.1/form/signdoc";
													form.style.display = "none";

													const signedXmlRequest = document.createElement("input");
													signedXmlRequest.type = "hidden";
													signedXmlRequest.name = "eSignRequest";
													signedXmlRequest.value = response.signedXmlRequest;
													form.appendChild(signedXmlRequest);

													const aspTxnID = document.createElement("input");
													aspTxnID.type = "hidden";
													aspTxnID.name = "aspTxnID";
													aspTxnID.value = txnId;
													form.appendChild(aspTxnID);

													const contentType = document.createElement("input");
													contentType.id = "Content-Type";
													contentType.name = "Content-Type";
													contentType.type = "hidden";
													contentType.value = "application/xml";
													form.appendChild(contentType);

													document.body.appendChild(form);

													console.log("Signed XML Request:", response.signedXmlRequest);
													console.log("Txn ID:", txnId);

													form.submit();
												} catch (err) {
													console.error("Error:", err);
												}
											}}
											disabled={getDisabled()}

										>
											{isSubmitting ? "Submitting..." : "Submit to Engineer"}
										</button>
									) : (
										<button
											type="button"
											className="btn btn-green"
											onClick={async () => {
												if (isSubmitting) return;
												setIsSubmitting(true)
												try {
													const doc = await generateInspectionPdf({
														rfiId: rfiData?.id,
														project: rfiData?.project,
														contractorRep,
														location: locationText,
														chainage,
														dateOfInspection,
														timeOfInspection,
														inspectionStatus,
													});

													const y = doc.lastAutoTable?.finalY
														? doc.lastAutoTable.finalY + 20
														: 50;


													const formData = new FormData();
													formData.append("sc", "Y");
													formData.append("rfiId", rfiData?.id ?? "");
													formData.append("signerName", "Pranavi" || "");
													formData.append("engineerName", "PVM" || "");
													formData.append("signY", Math.floor(y));


													const res = await fetch(`${API_BASE_URL}rfi/getEngSignedXmlRequest`, {
														method: "POST",
														body: formData,
														credentials: "include",
													});

													const response = await res.json();

													// 3. Redirect to CDAC eSign form
													const form = document.createElement("form");
													form.method = "POST";
													form.action = "https://es-staging.cdac.in/esignlevel2/2.1/form/signdoc";
													form.style.display = "none";

													const signedXmlRequest = document.createElement("input");
													signedXmlRequest.type = "hidden";
													signedXmlRequest.name = "eSignRequest";
													signedXmlRequest.value = response.signedXmlRequest;
													form.appendChild(signedXmlRequest);

													const aspTxnID = document.createElement("input");
													aspTxnID.type = "hidden";
													aspTxnID.name = "aspTxnID";
													aspTxnID.value = response.txnId;
													form.appendChild(aspTxnID);

													const contentType = document.createElement("input");
													contentType.id = "Content-Type";
													contentType.name = "Content-Type";
													contentType.type = "hidden";
													contentType.value = "application/xml";
													form.appendChild(contentType);

													document.body.appendChild(form);
													form.submit();
												} catch (err) {
													console.error("Error:", err);
												}
											}}
											disabled={getDisabled()}

										>
											{isSubmitting ? "Submitting..." : "Submit"}
										</button>
									)}
*/}
								</div>
							</div>
						)}

						{checklistPopup && (
							<ChecklistPopup
								rfiData={rfiData}
								enclosureName={enclosuresData.find(e => e.id === checklistPopup)?.enclosure}
								data={enclosureStates[checklistPopup]?.checklist}
								fetchChecklistData={fetchChecklistDataFromApi}
								onDone={(checklistData, grade) =>
									handleChecklistSubmit(checklistPopup, checklistData, grade)
								}
								onClose={() => setChecklistPopup(null)}
								statusMode={inspectionStatusMode}   // ✅ NEW
								engineerSubmitted={engineerSubmitted}   // 🔑 pass here


							/>
						)}

						{uploadPopup && (
							<UploadPopup
								onSubmit={file => handleUploadSubmit(uploadPopup, file)}
								onClose={() => setUploadPopup(null)}
							/>
						)}

						{showCamera && (
							<div className="popup">
								<CameraCapture
									facingMode={cameraMode}
									onCapture={(img) => {
										if (showCamera === 'selfie') {
											setSelfieImage(img); // preview for selfie
										} else if (showCamera.startsWith('gallery')) {
											const index = parseInt(showCamera.split('-')[1]);
											if (!isNaN(index)) {
												const file = base64ToFile(img, 'site-captured.jpg');
												const updated = [...galleryImages];
												updated[index] = file;
												setGalleryImages(updated); // for upload
												setSiteImage(img);         // for preview
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

// Updated ChecklistPopup component with autofill support
function ChecklistPopup({ rfiData, enclosureName, data, fetchChecklistData, onDone, onClose, statusMode, engineerSubmitted }) {
	const [checklistData, setChecklistData] = useState([]);
	const [gradeOfConcrete, setGradeOfConcrete] = useState('');
	const location = useLocation();
	const id = location.state?.rfi;
	const skipSelfie = location.state?.skipSelfie;
	const viewMode = location.state?.viewMode || false;
	const isReadOnly = statusMode === "SUBMITTED"; // 🟢 lock only when submitted

	const [errorMsg, setErrorMsg] = useState('');
	const [loading, setLoading] = useState(true);
	const [isExistingData, setIsExistingData] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				if (data && data.checklist && data.checklist.length > 0) {
					// Use existing data from props (must include action!)
					setChecklistData(data.checklist);
					setGradeOfConcrete(data.gradeOfConcrete || '');
					setIsExistingData(data.action === 'EDIT');
				} else {
					// Fetch data from API
					const result = await fetchChecklistData(rfiData.id, enclosureName);
					if (result?.checklist) {
						setChecklistData(result.checklist);
						setGradeOfConcrete(result.gradeOfConcrete || '');
						setIsExistingData(result.action === 'EDIT');
					} else {
						setChecklistData([]);
						setIsExistingData(false);
					}
				}
			} catch (error) {
				console.error("Error loading checklist data:", error);
				setChecklistData([]);
				setIsExistingData(false);
			} finally {
				setLoading(false);
			}
		};

		if (rfiData?.id && enclosureName) {
			fetchData();
		}
	}, [rfiData?.id, enclosureName, fetchChecklistData, data]);


	const handleChange = (id, field, value) => {
		setChecklistData(prev => prev.map(row =>
			row.id === id ? { ...row, [field]: value } : row
		));
	};


	const handleSelectAll = (field, value) => {
		if (!value) return;

		setChecklistData((prev) =>
			prev.map((row) => ({
				...row,
				[field]: value === "CLEAR" ? "" : value,
			}))
		);
	};
	const handleDone = () => {
		// If logged-in is Engineer → validate engineerStatus
		if (isEngineer) {
			if (checklistData.some(row => !row.engineerStatus)) {
				setErrorMsg("⚠️ Please fill Engineer Status (Yes/No/N/A) for all items.");
				return;
			}
		}

		// If logged-in is Contractor → validate contractorStatus
		else {
			if (checklistData.some(row => !row.contractorStatus)) {
				setErrorMsg("⚠️ Please fill Contractor Status (Yes/No/N/A) for all items.");
				return;
			}
		}

		// ✅ If everything is valid
		setErrorMsg("");
		onDone(checklistData, gradeOfConcrete);
	};



	// Define columns for DataTable
	const columns = [
		{
			name: 'ID',
			selector: row => row.id,
			width: '60px',
		},
		{
			name: 'Description',
			selector: row => row.description,
			wrap: true,
			minWidth: '250px',
		},
		{
			name: 'Contracor Status',
			cell: row => (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<input
							type="radio"
							name={`contractorStatus-${row.id}`}
							checked={row.contractorStatus === 'YES'}
							onChange={() => handleChange(row.id, 'contractorStatus', 'YES')}
							disabled={isReadOnly || deptFK === 'engg'}
						/> Yes
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<input
							type="radio"
							name={`contractorStatus-${row.id}`}
							checked={row.contractorStatus === 'NO'}
							onChange={() => handleChange(row.id, 'contractorStatus', 'NO')}
							disabled={isReadOnly || deptFK === 'engg'}
						/> No
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<input
							type="radio"
							name={`contractorStatus-${row.id}`}
							checked={row.contractorStatus === 'NA'}
							onChange={() => handleChange(row.id, 'contractorStatus', 'NA')}
							disabled={isReadOnly || deptFK === 'engg'}
						/> N/A
					</label>
				</div>
			),
			minWidth: '180px',
		},
		{
			name: 'Engineer Status',
			cell: row => (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<input
							type="radio"
							name={`engineerStatus-${row.id}`}
							checked={row.engineerStatus === 'YES'}
							onChange={() => handleChange(row.id, 'engineerStatus', 'YES')}
							disabled={!isEngineer || engineerSubmitted}
						/> Yes
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<input
							type="radio"
							name={`engineerStatus-${row.id}`}
							checked={row.engineerStatus === 'NO'}
							onChange={() => handleChange(row.id, 'engineerStatus', 'NO')}
							disabled={!isEngineer || engineerSubmitted}
						/> No
					</label>
					<label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<input
							type="radio"
							name={`engineerStatus-${row.id}`}
							checked={row.engineerStatus === 'NA'}
							onChange={() => handleChange(row.id, 'engineerStatus', 'NA')}
							disabled={!isEngineer || engineerSubmitted}
						/> N/A
					</label>
				</div>
			),
			minWidth: '180px',
		},
		{
			name: 'Contractor Remark',
			cell: row => (
				<input
					value={row.contractorRemark}
					onChange={e => handleChange(row.id, 'contractorRemark', e.target.value)}
					disabled={isReadOnly || deptFK === 'engg'}
					style={{ width: '100%', padding: '4px' }}
				/>
			),
			minWidth: '150px',
		},
		{
			name: 'Engineer Remark',
			cell: row => (
				<input
					value={row.aeRemark}
					onChange={e => handleChange(row.id, 'aeRemark', e.target.value)}
					disabled={!isEngineer || engineerSubmitted}
					style={{ width: '100%', padding: '4px' }}
				/>
			),
			minWidth: '150px',
		},
	];

	if (loading) {
		return (
			<div className="popup">
				<div className="popup-content" style={{ padding: '20px', textAlign: 'center' }}>
					Loading checklist data...
				</div>
			</div>
		);
	}

	return (
		<div className="popup">
			<div className="popup-content" style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
				{/* Add indicator for autofilled data */}
				{isExistingData && (
					<div style={{
						backgroundColor: '#e6f7ff',
						padding: '10px',
						border: '1px solid #91d5ff',
						borderRadius: '4px',
						marginBottom: '15px'
					}}>
						<strong>✓ Loaded existing checklist data</strong>
					</div>
				)}

				<div className="form-row">
					<div className="form-fields flex-1">
						<label>Name Of Work:</label>
						<input type="text" readOnly value={rfiData.work || ''} />
					</div>
					<div className="form-fields flex-2">
						<label>Date:</label>
						<input type="text" name="date" value={rfiData.dateOfInspection || ''} readOnly />
					</div>
				</div>
				<div className="form-row">


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
						<label>Grade of Concrete/Steel: </label>
						<input
							type="text"
							name="concrete_grade"
							id="concrete_grade"
							value={gradeOfConcrete}
							onChange={e => setGradeOfConcrete(e.target.value)}
							disabled={isReadOnly || deptFK === 'engg'} />
					</div>
				</div>

				<h3>
					{enclosureName ? enclosureName.toUpperCase() : ''}
				</h3>

				{/* ✅ Select All Dropdowns */}
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "20px",
						marginBottom: "10px",
						alignItems: "center",
					}}
				>
					{deptFK !== "engg" && (
						<div>
							<label style={{ marginRight: "5px", fontWeight: "bold" }}>
								Contractor Select All:
							</label>
							<select
								onChange={(e) => handleSelectAll("contractorStatus", e.target.value)}
								disabled={isReadOnly}
								defaultValue=""
							>
								<option value="">--Select--</option>
								<option value="YES">YES</option>
								<option value="NO">NO</option>
								<option value="NA">N/A</option>
								<option value="CLEAR">Clear All</option>
							</select>
						</div>
					)}

					{isEngineer && !engineerSubmitted && (
						<div>
							<label style={{ marginRight: "5px", fontWeight: "bold" }}>
								Engineer Select All:
							</label>
							<select
								onChange={(e) => handleSelectAll("engineerStatus", e.target.value)}
								defaultValue=""
							>
								<option value="">--Select--</option>
								<option value="YES">YES</option>
								<option value="NO">NO</option>
								<option value="NA">N/A</option>
								<option value="CLEAR">Clear All</option>
							</select>
						</div>
					)}
				</div>
				{checklistData.length > 0 ? (
					<DataTable
						columns={columns}
						data={checklistData}
						noHeader
						striped
						responsive
						pagination={checklistData.length > 10}
						paginationPerPage={10}
						customStyles={{
							headCells: {
								style: {
									backgroundColor: '#f5f5f5',
									fontWeight: 'bold',
								},
							},
							cells: {
								style: {
									padding: '8px',
									fontSize: '14px',
								},
							},
						}}
					/>
				) : (
					<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
						No checklist items found for this enclosure.
					</div>
				)}

				{errorMsg && (
					<div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
						{errorMsg}
					</div>
				)}

				<div
					className="popup-actions"
					style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}
				>
					<div className="checklist-popup-btn">
						<button onClick={onClose}>Cancel</button>

						{deptFK === 'engg' ? (
							<button
								onClick={handleDone}
								disabled={checklistData.length === 0}
								hidden={globalVarEnggSubmited === true}
							>
								Done
							</button>
						) : (
							<button
								onClick={handleDone}
								disabled={checklistData.length === 0}
								hidden={globalVarConSubmited === true}
							>
								Done
							</button>
						)}
					</div>
				</div>

			</div>
		</div>
	);
}
function UploadPopup({ onSubmit, onClose }) {
	const [file, setFile] = useState(null);

	return (
		<div className="popup">
			<div className="popup-content">
				<h3>Upload File</h3>
				<input type="file" onChange={e => setFile(e.target.files[0])} />
				<div className="popup-actions">
					<div className='checklist-popup-btn'>
						<button onClick={onClose}>Cancel</button>
						<button hidden={!file} onClick={() => onSubmit(file)}>Upload</button>
					</div>
				</div>
			</div>
		</div>
	);
}