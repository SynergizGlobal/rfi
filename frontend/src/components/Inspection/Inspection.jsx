import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate, useLocation } from 'react-router-dom';
import './Inspection.css';
import InspectionForm from '../InspectionForm/InspectionForm';
import DropdownPortal from '../DropdownPortal/DropdownPortal';
import axios from 'axios';
import { saveOfflineInspection, saveOfflineEnclosure, getAllOfflineEnclosures, getAllOfflineInspections, removeOfflineInspection, removeOfflineEnclosure, clearOfflineEnclosures, getOfflineEnclosures } from '../../utils/offlineStorage';
import { generateOfflineInspectionPdf, mergeWithExternalPdfs } from '../../utils/pdfGenerate';
import { connectEsignSocket, disconnectEsignSocket } from "../../utils/esignSocket";
import ReactDOM from "react-dom";



const DropdownMenu = ({ style, children }) => {
	return (
		<DropdownPortal>
			<div className="drop-down-menu" style={style} onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</DropdownPortal>
	);
};

const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();



const Inspection = () => {
	const [selectedRfi, setSelectedRfi] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [assignedPersons, setAssignedPersons] = useState({});
	const [pageSize, setPageSize] = useState(5);
	const [openDropdownRow, setOpenDropdownRow] = useState(null);
	const [dropdownInfo, setDropdownInfo] = useState({ rowId: null, targetRef: null });
	const buttonRefs = useRef({});
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [confirmPopupData, setConfirmPopupData] = useState(null);
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	const [completedOfflineInspections, setCompletedOfflineInspections] = useState({});

	const [showUploadPopup, setShowUploadPopup] = useState(false);
	const [showUploadPopupAttachDocs, setShowUploadPopupAttachDocs] = useState(false);
	const [attachmentDescription, setAttachmentDescription] = useState("");

	const [selectedTestType, setSelectedTestType] = useState('');
	const [uploadedFile, setUploadedFile] = useState(null);

	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();


	const [showAssignPopup, setShowAssignPopup] = useState(false);
	const [selectedPerson, setSelectedPerson] = useState('');
	const [engineerOptions, setEngineerOptions] = useState([]);
	const [selectedRfiForAssign, setSelectedRfiForAssign] = useState(null);


	const location = useLocation();
	const { filterStatus } = location.state || {};

	const changeExecutiveAllowedStatuses = [
		"CREATED",
		"UPDATED",
		"RESCHEDULED",
		"REASSIGNED",
		"CON_INSP_ONGOING",
		"INSPECTED_BY_CON",
	];


	useEffect(() => {
		fetch(`${API_BASE_URL}rfi/rfi-details`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error("Network error");
				}
				return res.json();
			})
			.then((data) => {
				let filteredData = data;

				// ✅ Apply status filter from Created RFI (via Dashboard navigation)
				if (filterStatus && filterStatus.length > 0) {
					if (filterStatus.includes("APPROVED")) {
						// Filter by approvalStatus for Accepted and closed card 
						filteredData = data.filter((rfi) => (rfi.approvalStatus === "Accepted" && (!rfi.validationStatus || rfi.validationStatus ==="APPROVED"))
						    && rfi.status === "INSPECTION_DONE");
					}
					else if (filterStatus.includes("REJECTED")) {
						// Filter by approvalStatus for rejected and closed card
						filteredData = data.filter((rfi) =>
						    (
						        (rfi.approvalStatus === "Rejected" && !rfi.validationStatus)

						        ||

						        (
						            (rfi.approvalStatus === "Rejected" || rfi.approvalStatus === "Accepted") &&
						            rfi.validationStatus === "REJECTED"
						        )
						    )
						    && rfi.status === "INSPECTION_DONE"
						);

					}
					else if (filterStatus.includes("CLOSED")) {
						// Filter by approvalStatus for Clsosed card (INSPECTION_DONE status rfi's) 
						filteredData = data.filter((rfi) => rfi.status === "INSPECTION_DONE");
					}

					else {
						// Default filter by status for other cards
						filteredData = data.filter((rfi) => filterStatus.includes(rfi.status));
					}
				}

				setData(filteredData);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setError("Failed to load RFI data");
				setLoading(false);
			});
	}, [filterStatus, API_BASE_URL]);

	const fetchUpdatedRfiData = async () => {
		try {
			setLoading(true);

			const res = await fetch(`${API_BASE_URL}rfi/rfi-details`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
			});

			if (!res.ok) {
				throw new Error("Network error");
			}

			const data = await res.json();
			let filteredData = data;

			// ✅ Apply same filtering logic as useEffect
			if (filterStatus && filterStatus.length > 0) {
				if (filterStatus.includes("REJECTED")) {
					// Filter by approvalStatus for rejected card
					filteredData = data.filter(
						(rfi) =>
							rfi.approvalStatus === "Rejected" &&
							rfi.status === "INSPECTION_DONE"
					);
				} else {
					// Default filter by status for other cards
					filteredData = data.filter((rfi) =>
						filterStatus.includes(rfi.status)
					);
				}
			}

			setData(filteredData);
			setLoading(false);
		} catch (err) {
			console.error("❌ Error fetching updated RFI data:", err);
			setError("Failed to load RFI data");
			setLoading(false);
		}
	};



	useEffect(() => {
		const stored = JSON.parse(localStorage.getItem("completedOfflineInspections") || "{}");
		setCompletedOfflineInspections(stored);
	}, [data]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			const portalEl = document.querySelector('.inspection-dropdown');
			const isInsidePortal = portalEl && portalEl.contains(e.target);
			const isInsideButton = Object.values(buttonRefs.current).some((ref) => ref?.contains(e.target));
			if (!isInsidePortal && !isInsideButton) {
				setDropdownInfo({ rowId: null, targetRef: null });
				setOpenDropdownRow(null);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);


	const generateUniqueTxnId = () => {
		const timestamp = Date.now();
		const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
		return `${timestamp}${randomSuffix}`;
	};

	const handleUploadTestReport = async () => {
		if (!selectedRfi) {
			alert("⚠️ No RFI selected.");
			return;
		}

		if (!selectedTestType) {
			alert("⚠️ Please select a test type (Site/Lab).");
			return;
		}

		if (!uploadedFile) {
			alert("⚠️ Please choose a file to upload.");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("rfiId", selectedRfi.id);
			formData.append("testType", selectedTestType);
			formData.append("file", uploadedFile);

			console.log("Uploading test report for RFI:", selectedRfi.id);

			const response = await fetch(`${API_BASE_URL}rfi/uploadPostTestReport`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await response.text();
			if (!response.ok) {
				alert("❌ Upload failed: " + text);
				return;
			}

			alert("✅ " + text);

			// Reset states after success
			setShowUploadPopup(false);
			setSelectedTestType("");
			setUploadedFile(null);

			// Refresh table data (if provided)
			if (typeof fetchUpdatedRfiData === "function") {
				fetchUpdatedRfiData();
			}
		} catch (err) {
			console.error("Upload error:", err);
			alert("❌ Failed to upload: " + err.message);
		}
	};

	const isInspectionTimeValid = (rowDate, rowTime) => {
		if (!rowDate || !rowTime) return false;

		const [dd, mm, yyyy] = rowDate.split("-");

		const cleanTime =
			rowTime.split(".")[0].length === 5 ? `${rowTime}:00` : rowTime.split(".")[0];

		const formatted = `${yyyy}-${mm}-${dd}T${cleanTime}`;

		const scheduled = new Date(formatted);
		const now = new Date();

		console.log("Formatted:", formatted);
		console.log("Scheduled:", scheduled);
		console.log("Now:", now);

		if (isNaN(scheduled.getTime())) return false;

		return now >= scheduled;
	};



	const handleInspectionComplete = (rfi, status, dateOfInspection, timeOfInspection) => {

		if (!isInspectionTimeValid(dateOfInspection, timeOfInspection)) {
			alert("❌ Inspection cannot be started before the scheduled date and time.");
			return;
		}


		if (status === "INSPECTION_DONE") {
			alert("Inspection is already closed. Further inspection not allowed.");
			return;
		}
		if (status === "VALIDATION_PENDING") {
			alert("Inspection is under validation process. Further inspection not allowed");
			return;
		}
		const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();
		if (deptFK === "engg") {
			if (status === "INSPECTED_BY_AE") {
				alert("Inspection Submitted . Further inspection not allowed.");
				return;
			}
			const allowedStatuses = ["INSPECTED_BY_CON", "AE_INSP_ONGOING", "UPDATED", "RESCHEDULED", "REASSIGNED"];
			if (!allowedStatuses.includes(status)) {
				alert("Inspection not allowed until Contractor completes inspection.");
				return;
			}
		}
		else {
			if (status === "INSPECTED_BY_CON") {
				alert("Inspection Submitted . Further inspection not allowed.");
				return;
			}
			const allowedStatuses = ["CREATED", "CON_INSP_ONGOING", "UPDATED", "RESCHEDULED", "REASSIGNED"];
			if (!allowedStatuses.includes(status)) {
				alert("Inspection Submitted . Further inspection not allowed.");
				return;
			}
		}
		navigate(`/InspectionForm`, { state: { rfi } });
	};


	const [downloadingId, setDownloadingId] = useState(null);


	//	const handleDownloadSiteImagesPdf = async (id, uploadedBy, rfiId) => {
	//		const isContractor = uploadedBy?.toLowerCase() === "contractor";
	//		const uniqueId = isContractor ? id : `client-${id}`;
	//		const fileNameGenerated = `${rfiId}_${isContractor ? "Contractor" : "Client"}_SiteImages.pdf`;
	//		try {
	//			setDownloadingId(uniqueId);
	//
	//			const response = await fetch(
	//				`${API_BASE_URL}rfi/downloadSiteImagesPdf?id=${id}&uploadedBy=${uploadedBy}`
	//			);
	//
	//			if (!response.ok) {
	//				alert("No images found or failed to generate PDF.");
	//				return;
	//			}
	//			const blob = await response.blob();
	//			const url = window.URL.createObjectURL(blob);
	//			const link = document.createElement("a");
	//			link.href = url;
	//			const filename = fileNameGenerated;
	//			link.setAttribute("download", filename);
	//			document.body.appendChild(link);
	//			link.click();
	//			link.remove();
	//		} catch (err) {
	//			console.error("PDF download error:", err);
	//			alert("Failed to download PDF.");
	//		} finally {
	//			setDownloadingId(null);
	//		}
	//	};





	// Initialize assignedPersons from fetched data
	useEffect(() => {
		if (data && data.length > 0) {
			const assignedMap = {};
			data.forEach(rfi => {
				if (rfi.assignedPersonClient) {
					assignedMap[rfi.id] = rfi.assignedPersonClient;
				}
			});
			setAssignedPersons(assignedMap);
		}
	}, [data]);

	// Fetch engineers whenever RFI selection changes
	useEffect(() => {
		if (selectedRfiForAssign) {
			fetchEngineersForContract(selectedRfiForAssign.contractId);
		}
	}, [selectedRfiForAssign]);

	const fetchEngineersForContract = async (contractId) => {
		const userId = localStorage.getItem('userId');
		if (!userId) {
			console.error("❌ Missing userId in localStorage, cannot fetch engineers");
			return;
		}

		if (!contractId) {
			console.error("❌ No contractId provided to fetch engineers");
			return;
		}
		try {
			const response = await fetch(
				`${API_BASE_URL}api/auth/engineer-names?userId=${encodeURIComponent(userId)}&contractId=${encodeURIComponent(contractId)}`
			);

			console.log(`Request URL: ${API_BASE_URL}api/auth/engineer-names?userId=${userId}&contractId=${contractId}`);
			console.log("Response OK?", response.ok, "Status:", response.status);

			const contentType = response.headers.get("Content-Type");
			const body = contentType && contentType.includes("application/json")
				? await response.json()
				: await response.text();

			if (!response.ok) {
				console.error("❌ Backend error:", body);
				throw new Error(`Failed to fetch engineers for ${contractId}`);
			}

			console.log("✅ Engineers:", body);
			setEngineerOptions(Array.isArray(body) ? body : []); // ensure array
		} catch (err) {
			console.error("🔥 Fetch error:", err);
		}
	};


	const handleSelectPerson = (e) => {
		setSelectedPerson(e.target.value);
	};

	const handleAssignSubmit = async () => {
		if (!selectedRfiForAssign || !selectedPerson) return;


		try {
			const response = await fetch(`${API_BASE_URL}rfi/assign-client-person`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },


				body: JSON.stringify({
					rfi_Id: selectedRfiForAssign.rfi_Id, 
					assignedPersonClient: selectedPerson,
					clientDepartment: deptFK,
				}),

				credentials: "include",
			});
			console.log("Submitting RFI assignment:", {
				rfiId: selectedRfiForAssign.id,
				assignedPersonClient: selectedPerson,
				clientDepartment: deptFK,
			});


			if (response.ok) {
				setAssignedPersons(prev => ({
					...prev,
					[selectedRfiForAssign.id]: selectedPerson
				}));
				setShowAssignPopup(false);
				setSelectedPerson('');
				fetchUpdatedRfiData();
			} else {
				alert("Assignment failed: " + (await response.text()));
			}
			fetchUpdatedRfiData();
		} catch (err) {
			console.error(err);
			alert("Error assigning person");
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

	const handleClosePopPupAttachement = async () => {
		setShowUploadPopupAttachDocs(false);
		setUploadedFile(null);
		setAttachmentDescription("");
	}

	const handleClosePopPupTestResult = async () => {
		setShowUploadPopup(false);
		setUploadedFile(null);
		setSelectedTestType("");
	}


	const handleUploadAttachment = async () => {
		try {
			if (!selectedRfi?.id) {
				alert("No RFI selected!");
				return;
			}

			if (!uploadedFile) {
				alert("Please select a file!");
				return;
			}

			const rfiId = selectedRfi.id;

			const formData = new FormData();
			formData.append("rfiId", rfiId);
			formData.append("description", attachmentDescription?.trim() || "");
			formData.append("file", uploadedFile);

			const res = await fetch(`${API_BASE_URL}rfi/upload-attachment`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const msg = await res.text();

			if (res.ok) {
				alert(msg);

				// ✅ reset
				setUploadedFile(null);
				setAttachmentDescription("");
				setShowUploadPopupAttachDocs(false);


			} else {
				alert("Upload Failed: " + msg);
			}
		} catch (err) {
			console.error(err);
			alert("Upload Error: " + err.message);
		}
	};

	const RfiDescCell = ({ value }) => {
		const [showPopup, setShowPopup] = useState(false);

		if (!value) return null;

		const modalContent = (
			<div className="popup-modal-rfi-loglist bg-black bg-opacity-50 z-50">
				<div className="popup-modal-inner bg-white rounded-xl shadow-lg p-4 max-w-md w-full">
					<h2 className="text-lg font-semibold mb-2">Rfi Description</h2>
					<p className="text-gray-700 whitespace-pre-wrap ">{value}</p>
					<div className='d-flex justify-content-end'>
						<button
							onClick={() => setShowPopup(false)}
							className="btn btn-white"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
		return (
			<>
				{value.length > 50 ? (
					<>
						<button
							onClick={() => setShowPopup(true)}
							className="text-blue-600 underline"
						>
							👁️
						</button>
						{showPopup &&
							ReactDOM.createPortal(
								modalContent,
								document.querySelector(".dashboard")
							)}
					</>
				) : (
					<span>{value}</span>
				)}
			</>
		);
	};


	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfi_Id' },
		{ Header: 'Raised Date', accessor: 'dateOfSubmission' },
		{ Header: 'Structure', accessor: 'structure' },
		{ Header: 'Element', accessor: 'element' },
		{ Header: 'Activity', accessor: 'activity' },
		{
			Header: 'RFI Description',
			accessor: 'rfiDescription',
			Cell: ({ value }) => <RfiDescCell value={value} />
		},
		{ Header: 'Assigned Contractor', accessor: 'nameOfRepresentative' },
		{
			Header: "Assigned Employer's Engineer",
			Cell: ({ row }) => {
				const assignedEngineer = assignedPersons[row.original.id] || row.original.assignedPersonClient || '—';
				return <span>{assignedEngineer}</span>; // Only display name
			}
		},

		{ Header: 'Measurement Type', accessor: 'measurementType' },
		{ Header: 'Total Qty', accessor: 'totalQty' },
		{
			Header: 'Inspection Status',
			accessor: 'status'
		},
		//		{
		//			Header: 'Download Contractor Images',
		//			Cell: ({ row }) => {
		//				const isDownloading = downloadingId === row.original.id;
		//				const hasContractorImage = row.original.imgContractor !== null;
		//
		//				return hasContractorImage ? (
		//					<button
		//						onClick={() => handleDownloadSiteImagesPdf(row.original.id, 'Contractor', row.original.rfi_Id)}
		//						className="btn-download"
		//						disabled={isDownloading}
		//					>
		//						{isDownloading ? '⏳ Downloading...' : '⬇️'}
		//					</button>
		//				) : (
		//					<span style={{ color: '#888' }}></span>
		//				);
		//			}
		//		},
		//		{
		//			Header: 'Download Client Images',
		//			Cell: ({ row }) => {
		//				const isDownloading = downloadingId === `client-${row.original.id}`;
		//				const hasClientImage = row.original.imgClient !== null;
		//
		//				return hasClientImage ? (
		//					<button
		//						onClick={() => handleDownloadSiteImagesPdf(row.original.id, 'Regular User', row.original.rfi_Id)}
		//						className="btn-download"
		//						disabled={isDownloading}
		//					>
		//						{isDownloading ? '⏳ Downloading...' : '⬇️'}
		//					</button>
		//				) : (
		//					<span style={{ color: '#888' }}></span>
		//				);
		//			}
		//		},
		{
			Header: 'Action',
			Cell: ({ row }) => {
				const btnRef = useRef(null);

				useEffect(() => {
					buttonRefs.current[row.id] = btnRef.current;
				}, [row.id]);

				const isDropdownOpen = openDropdownRow === row.id;

				return (
					<div className="action-dropdown">
						<button
							ref={btnRef}
							className="action-button"
							onClick={(e) => {
								e.stopPropagation();
								const target = btnRef.current;
								if (isDropdownOpen) {
									setOpenDropdownRow(null);
									setDropdownInfo({ rowId: null, targetRef: null });
								} else {
									setOpenDropdownRow(row.id);
									setDropdownInfo({ rowId: row.id, targetRef: target });
								}
							}}
						>
							⋮
						</button>

						{isDropdownOpen && dropdownInfo.targetRef && (
							<DropdownPortal
								targetRef={dropdownInfo.targetRef}
								onClose={() => {
									setOpenDropdownRow(null);
									setDropdownInfo({ rowId: null, targetRef: null });
								}}
							>
								<button
									onClick={() => {


										console.log("Full Row Data:", row.original);

										console.log("Row Date:", row.original.dateOfInspection);
										console.log("Row Time:", row.original.timeOfInspection);

										if (!isInspectionTimeValid(row.original.dateOfInspection, row.original.timeOfInspection)) {
											alert("Inspection cannot be started before the scheduled date and time.");
											return;
										}
										handleInspectionComplete(
											row.original.id,
											row.original.status,
											row.original.dateOfInspection,
											row.original.timeOfInspection
										);
									}}
								>
									Start Inspection Online
								</button>

								<button
									onClick={() => {

										const r = row.original;

										// 1) Scheduled time check
										if (!isInspectionTimeValid(r.dateOfInspection, r.timeOfInspection)) {
											alert("Inspection cannot be started before the scheduled date and time.");
											return;
										}

										// 2) Common conditions
										if (r.status === "INSPECTION_DONE") {
											alert("Inspection is already closed. Further inspection not allowed.");
											return;
										}
										if (r.status === "VALIDATION_PENDING") {
											alert("Inspection is under validation process. Further inspection not allowed.");
											return;
										}

										const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();

										// 3) ENGINEERING CHECK (AE/Client)
										if (deptFK === "engg") {

											if (r.status === "INSPECTED_BY_AE") {
												alert("Inspection Submitted. Further inspection not allowed.");
												return;
											}

											const allowedStatuses = [
												"INSPECTED_BY_CON",
												"AE_INSP_ONGOING",
												"UPDATED",
												"RESCHEDULED",
												"REASSIGNED"
											];

											if (!allowedStatuses.includes(r.status)) {
												alert("Inspection not allowed until Contractor completes inspection.");
												return;
											}
										}

										// 4) CONTRACTOR CHECK
										else {

											if (r.status === "INSPECTED_BY_CON") {
												alert("Inspection Submitted. Further inspection not allowed.");
												return;
											}

											const allowedStatuses = [
												"CREATED",
												"CON_INSP_ONGOING",
												"UPDATED",
												"RESCHEDULED",
												"REASSIGNED"
											];

											if (!allowedStatuses.includes(r.status)) {
												alert("Inspection Submitted. Further inspection not allowed.");
												return;
											}
										}

										// 5) If all conditions are satisfied → Start Offline
										navigate('/InspectionForm', {
											state: { rfi: r.id, skipSelfie: false, offlineMode: true }
										});

										setOpenDropdownRow(null);
										setDropdownInfo({ rowId: null, targetRef: null });
									}}
									disabled={row.original.status === "CANCELLED"}
									style={row.original.status === "CANCELLED" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
								>
									Start Inspection Offline
								</button>

								{row.original.approvalStatus?.toLowerCase() === 'accepted' && (
									<button
										onClick={() => {
											setSelectedRfi(row.original);
											setShowUploadPopupAttachDocs(true);
										}}
									>
										Upload Attachments
									</button>
								)}


								{(deptFK.toLowerCase() === 'engg' || userRole === 'it admin') &&
									row.original.status === 'INSPECTED_BY_AE' &&
									row.original.approvalStatus?.toLowerCase() === 'accepted' && (
										<button
											onClick={() => {
												setConfirmPopupData({
													message: "Are you sure you want to send this RFI for validation?",
													rfiId: row.original.id,
													onConfirm: (id) => {
														fetch(`${API_BASE_URL}api/validation/send-for-validation/${id}`, {
															method: "POST",
															headers: { "Content-Type": "application/json" },
															credentials: "include"
														})
															.then(async (res) => {
																const text = await res.text();
																console.log("📌 API response status:", res.status, "body:", text);

																if (!res.ok) {
																	alert("❌ " + text);
																} else {
																	alert("✅ " + text);
																	await fetchUpdatedRfiData();
																	navigate('/Validation');
																}
																setConfirmPopupData(null);
																
															})
															.catch((err) => {
																console.error("❌ API error:", err);
																alert("⚠️ Something went wrong while sending RFI.");
																setConfirmPopupData(null);
															});
													},
												});
											}}
										>
											Send for Validation
										</button>
									)}

								{userRole === "data admin" &&
									changeExecutiveAllowedStatuses.includes(row.original.status) && (
										<div>
											<button
												onClick={() => {
													setSelectedRfiForAssign(row.original);
													setShowAssignPopup(true);
													fetchEngineersForContract(row.original.contractId);
												}}
											>
												{assignedPersons[row.original.id]
													? "Change Executive"
													: "Assign Executive"}
											</button>
										</div>
									)}



								{(deptFK.toLowerCase() === 'engg' || userRole === 'it admin' || userRole === 'data admin') &&
									row.original.status === 'INSPECTED_BY_AE' &&
									row.original.approvalStatus?.toLowerCase() === 'accepted' && (
										<button
											onClick={() => {
												setConfirmPopupData({
													message: "Are you sure you want to close RFI?",
													rfiId: row.original.id,
													onConfirm: (id) => {
														fetch(`${API_BASE_URL}rfi/close/rfi/${id}`, {
															method: "POST",
															headers: { "Content-Type": "application/json" },
														})
															.then(async (res) => {
																const text = await res.text();
																console.log("📌 API response status:", res.status, "body:", text);

																if (!res.ok) {
																	alert("❌ " + text);
																} else {
																	alert("✅ " + text);
																	await fetchUpdatedRfiData();
																}
																setConfirmPopupData(null);
															})
															.catch((err) => {
																console.error("❌ API error:", err);
																alert("⚠️ Something went wrong while closing the RFI.");
																setConfirmPopupData(null);
															});
													},
												});
											}}
										>
											Close RFI
										</button>
									)}

								{(userRole === 'it admin' || userRole === 'data admin') ? (
									// ✅ Show only this button for IT Admin
									<button
										onClick={() => {
											navigate('/InspectionForm', {
												state: { rfi: row.original.id, skipSelfie: true, viewMode: true },
											});
											setOpenDropdownRow(null);
											setDropdownInfo({ rowId: null, targetRef: null });
										}}
									>
										View
									</button>
								) : (
									<>
										{deptFK === 'engg' &&
											(row.original.status === 'INSPECTED_BY_AE' ||
												row.original.status === 'AE_INSP_ONGOING' ||
												row.original.status === 'VALIDATION_PENDING' ||
												row.original.status === 'INSPECTION_DONE') && (
												<button
													onClick={() => {
														navigate('/InspectionForm', {
															state: { rfi: row.original.id, skipSelfie: true, viewMode: true },
														});
														setOpenDropdownRow(null);
														setDropdownInfo({ rowId: null, targetRef: null });
													}}
												>
													View
												</button>
											)}

										{deptFK !== 'engg' && row.original.status !== 'CREATED' && (
											<button
												onClick={() => {
													navigate('/InspectionForm', {
														state: { rfi: row.original.id, skipSelfie: true, viewMode: true },
													});
													setOpenDropdownRow(null);
													setDropdownInfo({ rowId: null, targetRef: null });
												}}
											>
												View
											</button>
										)}
									</>
								)}


								{userRole !== 'engg' && (

									<button
										disabled={!completedOfflineInspections[row.original.id]}
										onClick={async () => {
											try {
												const confirmed = await showConfirmationModal(
													"I hereby confirm that the information submitted in this RFI is accurate and complete to the best of my knowledge. I authorize the use of my E-Sign solely for identity verification (KYC) for submission authentication."
												);

												if (!confirmed) {
													alert("Submission cancelled.");
													return;
												}

												const rfiId = row.original.id;
												if (!rfiId) throw new Error("Invalid RFI");

												// ================= OFFLINE DATA =================
												const offlineDataArr = await getAllOfflineInspections(rfiId);
												const offlineData = offlineDataArr[0];
												const enclosures = await getOfflineEnclosures(rfiId);

												const pdfDoc = await generateOfflineInspectionPdf({
													selfieImage: offlineData.selfieImage,
													galleryImages: offlineData.galleryImages,
													testReportFile: offlineData.testReportFile,
													enclosureImages: enclosures
												});

												const pdfBlob = pdfDoc.output("blob");

												// ================= CONTRACTOR =================
												if (deptFK !== "engg") {
													const pdfFormData = new FormData();
													pdfFormData.append("pdf", pdfBlob, `${rfiId}.pdf`);
													pdfFormData.append("rfiId", rfiId);

													// Upload contractor PDF
													const uploadRes = await fetch(`${API_BASE_URL}rfi/uploadPdfContractor`, {
														method: "POST",
														body: pdfFormData,
														credentials: "include"
													});
													if (!uploadRes.ok) throw new Error("Contractor PDF upload failed");

													// Stamp contractor PDF
													const stampForm = new FormData();
													stampForm.append("rfiId", rfiId);
													stampForm.append("txnId", generateUniqueTxnId());

													const stampRes = await fetch(`${API_BASE_URL}rfi/stampPdfFromXml`, {
														method: "POST",
														body: stampForm,
														credentials: "include"
													});
													const stampData = await stampRes.json();
													if (!stampRes.ok || stampData.status === "error") {
														throw new Error(stampData.message || "Contractor PDF stamping failed");
													}

													alert("Contractor PDF stamped successfully");
												}

												// ================= ENGINEER =================
												else {
													const pdfFormData = new FormData();
													pdfFormData.append("pdf", pdfBlob, `${rfiId}.pdf`);
													pdfFormData.append("rfiId", rfiId);

													// Upload engineer PDF
													const uploadRes = await fetch(`${API_BASE_URL}rfi/rfi/uploadPdf/Engg`, {
														method: "POST",
														body: pdfFormData,
														credentials: "include"
													});
													if (!uploadRes.ok) throw new Error("Engineer PDF upload failed");

													// Stamp engineer PDF
													const stampForm = new FormData();
													stampForm.append("rfiId", rfiId);

													const stampRes = await fetch(`${API_BASE_URL}rfi/stampEnggPdfFromXml`, {
														method: "POST",
														body: stampForm,
														credentials: "include"
													});
													const stampData = await stampRes.json();
													if (!stampRes.ok || stampData.status === "error") {
														throw new Error(stampData.message || "Engineer PDF stamping failed");
													}

													alert("Engineer PDF stamped successfully");
												}

												// ================= LOCK =================
												/*												setInspectionStatusMode("SUBMITTED");
																								localStorage.setItem(`inspectionLocked_${rfiId}`, "true");
												*/
												/*												navigate("/inspection");
												*/
												// Clear offline cache
												await removeOfflineInspection(rfiId);
												await clearOfflineEnclosures(rfiId);

											} catch (err) {
												console.error(err);
												disconnectEsignSocket();
												alert(err.message || "Submit failed");
											}
										}}
									>
										Submit
									</button>


									/*<button
										disabled={!completedOfflineInspections[row.original.id]}
										onClick={async () => {
											try {
												const offlineDataArr = await getAllOfflineInspections(row.original.id);
												const offlineData = offlineDataArr[0]; // ✅ Get the actual object

												console.log("📌 Offline Data object:", offlineData);
												console.log("📌 Selfie:", offlineData.selfieImage);
												console.log("📌 Gallery:", offlineData.galleryImages);
												const enclosures = await getOfflineEnclosures(row.original.id);
												console.log("📌 Enclosures fetched from DB:", enclosures);
												const doc = await generateOfflineInspectionPdf({
													selfieImage: offlineData.selfieImage,
													galleryImages: offlineData.galleryImages,
													testReportFile: offlineData.testReportFile,
													enclosureImages: enclosures,
												});


												// 3️⃣ Save locally for user confirmation
												doc.save(`Offline_Inspection_${row.original.id}.pdf`);

												// 4️⃣ Convert PDF to Blob
												const pdfBlob = doc.output("blob");

												// 5️⃣ Upload to backend
												const pdfFormData = new FormData();
												pdfFormData.append("pdf", pdfBlob, `${row.original.id}.pdf`);
												pdfFormData.append("rfiId", row.original.id);

												const uploadRes = await fetch(`${API_BASE_URL}rfi/uploadPdf`, {
													method: "POST",
													body: pdfFormData,
													credentials: "include",
												});

												if (!uploadRes.ok) throw new Error("Failed to upload offline PDF");

												// 6️⃣ Trigger DSC sign request
												const txnId = generateUniqueTxnId();
												const signForm = new FormData();
												signForm.append("pdfBlob", pdfBlob);
												signForm.append("sc", "Y");
												signForm.append("txnId", txnId);
												signForm.append("rfiId", row.original.id);
												signForm.append("signerName", "Swathi");
												signForm.append("contractorName", "M V");
												signForm.append("signY", 100);

												const signRes = await fetch(`${API_BASE_URL}rfi/getSignedXmlRequest`, {
													method: "POST",
													body: signForm,
													credentials: "include",
												});

												const response = await signRes.json();

												// 7️⃣ Auto-submit DSC form
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
												aspTxnID.value = txnId;
												form.appendChild(aspTxnID);

												const contentType = document.createElement("input");
												contentType.type = "hidden";
												contentType.name = "Content-Type";
												contentType.value = "application/xml";
												form.appendChild(contentType);

												document.body.appendChild(form);
												form.submit();

												// 8️⃣ Clear offline cache
												await removeOfflineInspection(row.original.id);
												await clearOfflineEnclosures(row.original.id);

												alert("✅ Offline inspection submitted successfully with images + DSC!");
											} catch (err) {
												console.error("❌ Offline submit failed:", err);
												alert("Failed to submit offline inspection: " + err.message);
											}
										}}

									>
										Submit
									</button>
*/


								)}




								{deptFK === 'engg' ? (
									row.original.status === "INSPECTION_DONE" && (row.original.testResEngg === null || row.original.testResEngg === "") && (
										<button
											onClick={() => {
												setSelectedRfi(row.original);
												setShowUploadPopup(true);
											}}
										>
											Upload Test Results
										</button>
									)
								) : (
									row.original.status === "INSPECTION_DONE" && row.original.testResCon === null && (
										<button
											onClick={() => {
												setSelectedRfi(row.original);
												setShowUploadPopup(true);
											}}
										>
											Upload Test Results
										</button>
									)
								)}


							</DropdownPortal>
						)}
					</div>
				);
			}
		}
	], [openDropdownRow, data]);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		prepareRow,
		rows,
		state: { pageIndex, globalFilter },
		setGlobalFilter,
		nextPage,
		previousPage,
		canNextPage,
		canPreviousPage,
		pageOptions,
		gotoPage,
		setPageSize: tableSetPageSize,
	} = useTable(
		{
			columns,
			data,
			initialState: { pageIndex: 0, pageSize },
			getRowId: row => row.rfi_Id,
		},
		useGlobalFilter,
		usePagination
	);


	useEffect(() => {
		tableSetPageSize(pageSize);
	}, [pageSize, tableSetPageSize]);


	return (
		<div className="dashboard credted-rfi inspection">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-table-container">
						<h2 className="section-heading">INSPECTION LIST</h2>

						<div className="table-top-bar d-flex justify-content-between align-items-center">
							<div className="left-controls">
								<label>
									Show{' '}
									<select
										value={pageSize}
										onChange={(e) => setPageSize(Number(e.target.value))}
									>
										{[5, 10, 20, 50].map((size) => (
											<option key={size} value={size}>
												{size}
											</option>
										))}
									</select>{' '}
									entries
								</label>
							</div>
							<div className="right-controls">
								<input
									className="search-input"
									value={globalFilter || ''}
									onChange={(e) => setGlobalFilter(e.target.value)}
									placeholder="Search RFI..."
								/>
							</div>
						</div>

						<div className="table-section">
							<div className="table-wrapper">
								<table {...getTableProps()} className="responsive-table">
									<thead>
										{headerGroups.map((group) => (
											<tr {...group.getHeaderGroupProps()}>
												{group.headers.map((col) => (
													<th {...col.getHeaderProps()}>{col.render('Header')}</th>
												))}
											</tr>
										))}
									</thead>
									<tbody {...getTableBodyProps()}>
										{page.map((row) => {
											prepareRow(row);
											return (
												<tr {...row.getRowProps()}>
													{row.cells.map((cell) => (
														<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
													))}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>

						<div className="d-flex align-items-center justify-content-between">
							<span>
								Showing {rows.length === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
								{Math.min((pageIndex + 1) * pageSize, rows.length)} of {rows.length} entries
							</span>

							<div className="pagination">
								<button onClick={previousPage} disabled={!canPreviousPage}>
									«
								</button>

								{/* Current Page / Total Pages */}
								<span style={{ fontWeight: 'bold' }}>
									Page {pageIndex + 1} of {pageOptions.length}
								</span>


								{/* Next Button */}
								<button onClick={nextPage} disabled={!canNextPage}>
									»
								</button>
							</div>
							<div></div>
						</div>
					</div>
				</div>
				{confirmPopupData && (
					<div className="popup">
						<h3>Send for Validation</h3>
						<p>{confirmPopupData.message}</p>
						<div className="popup-actions">
							<div className='sendForValidation-popup-btn'>
								<button onClick={() => setConfirmPopupData(null)}>Cancel</button>
								<button onClick={() => confirmPopupData.onConfirm(confirmPopupData.rfiId)}>
									Yes
								</button>
							</div>
						</div>
					</div>
				)}

				{showAssignPopup && (
					<div className="popup-overlay">
						<div className="popup">
							<h3>Select Person to Assign</h3>
							<select onChange={handleSelectPerson} value={selectedPerson || ''}>
								<option value="" disabled>Select</option>
								{engineerOptions.map((username, idx) => (
									<option key={idx} value={username}>{username}</option>
								))}
							</select>
							<div className='popup-buttons'>
								<button onClick={() => setShowAssignPopup(false)}>Cancel</button>
								<button onClick={handleAssignSubmit}>Done</button>
							</div>
						</div>
					</div>
				)}

				{showUploadPopup && (
					<div className="inspection popup-overlay" onClick={() => setShowUploadPopup(false)}>
						<div className="upload-popup" onClick={(e) => e.stopPropagation()}>
							<button className="close-btn" onClick={handleClosePopPupTestResult}>✖</button>
							<h3>Upload Test Results</h3>

							<div className="form-group">
								<label>Tests in Site/Lab:</label>
								<select
									value={selectedTestType}
									onChange={(e) => setSelectedTestType(e.target.value)}
								>
									<option value="">-- Select --</option>
									<option value="Site">Site</option>
									<option value="Lab">Lab</option>
								</select>
							</div>

							<div className="form-group">
								<label>Tests in Lab/Site:</label>
								<a
									href="#"
									className="upload-link"
									onClick={(e) => {
										e.preventDefault();
										document.getElementById("uploadInput").click();
									}}
								>
									Upload Documents 📄
								</a>
								<input
									type="file"
									id="uploadInput"
									style={{ display: "none" }}
									accept=".pdf,application/pdf"
									onChange={(e) => setUploadedFile(e.target.files[0])}
								/>
								{uploadedFile && <p>Uploaded: {uploadedFile.name}</p>}
							</div>

							<button className="done-btn" onClick={handleUploadTestReport}>
								Upload
							</button>
						</div>
					</div>
				)}


				{showUploadPopupAttachDocs && (
					<div
						className="inspection popup-overlay"
						onClick={() => setShowUploadPopupAttachDocs(false)}   // ✅ correct close
					>
						<div className="upload-popup" onClick={(e) => e.stopPropagation()}>
							<button className="close-btn" onClick={handleClosePopPupAttachement}>
								✖
							</button>

							<h3>Upload Attachment</h3>

							{/* ✅ DESCRIPTION */}
							<div className="form-group">
								<label>Description:</label>
								<input
									type="text"
									value={attachmentDescription}
									onChange={(e) => setAttachmentDescription(e.target.value)}
									placeholder="Enter description"
								/>
							</div>

							{/* ✅ FILE */}
							<div className="form-group">
								<label>Attach File:</label>

								<a
									href="#"
									className="upload-link"
									onClick={(e) => {
										e.preventDefault();
										document.getElementById("uploadInputAttachment").click();
									}}
								>
									Upload Documents 📄
								</a>

								<input
									type="file"
									id="uploadInputAttachment"
									style={{ display: "none" }}
									accept=".pdf,application/pdf"
									onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
								/>

								{uploadedFile && <p style={{ text: "none" }}><strong>Selected File:</strong> {uploadedFile.name}</p>}
							</div>

							<button className="done-btn" onClick={handleUploadAttachment}>
								Upload
							</button>
						</div>
					</div>
				)}




			</div>
		</div>
	);
};

export default Inspection;