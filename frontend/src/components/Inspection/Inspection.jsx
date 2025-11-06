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
	const [selectedTestType, setSelectedTestType] = useState('');
	const [uploadedFile, setUploadedFile] = useState(null);

	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();

	const location = useLocation();
	const { filterStatus } = location.state || {};



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
			         if (filterStatus.includes("REJECTED")) {
			           // Filter by approvalStatus for rejected card
			           filteredData = data.filter((rfi) => rfi.approvalStatus === "Rejected"  && rfi.status === "INSPECTION_DONE");
			         } else {
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


	const handleInspectionComplete = (rfi, status) => {

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
			const allowedStatuses = ["INSPECTED_BY_CON", "AE_INSP_ONGOING",	"UPDATED","RESCHEDULED","REASSIGNED"];
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
			const allowedStatuses = ["CREATED", "CON_INSP_ONGOING","UPDATED","RESCHEDULED","REASSIGNED"];
			if (!allowedStatuses.includes(status)) {
				alert("Inspection Submitted . Further inspection not allowed.");
				return;
			}
		}
			navigate(`/InspectionForm`, { state: { rfi } });
		};


	const [downloadingId, setDownloadingId] = useState(null);
	
	
	const handleDownloadSiteImagesPdf = async (id, uploadedBy,rfiId) => {
		const isContractor = uploadedBy?.toLowerCase() === "contractor";
		const uniqueId = isContractor ? id : `client-${id}`;
		const fileNameGenerated = `${rfiId}_${isContractor ? "Contractor" : "Client"}_SiteImages.pdf`;
		try {
			setDownloadingId(uniqueId);

			const response = await fetch(
				`${API_BASE_URL}rfi/downloadSiteImagesPdf?id=${id}&uploadedBy=${uploadedBy}`
			);

			if (!response.ok) {
				alert("No images found or failed to generate PDF.");
				return;
			}
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const filename = fileNameGenerated;
			link.setAttribute("download", filename);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			console.error("PDF download error:", err);
			alert("Failed to download PDF.");
		} finally {
			setDownloadingId(null);
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

	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfi_Id' },
		{ Header: 'Project', accessor: 'project' },
		{ Header: 'Structure', accessor: 'structure' },
		{ Header: 'Element', accessor: 'element' },
		{ Header: 'Activity', accessor: 'activity' },
		{ Header: 'Assigned Contractor', accessor: 'createdBy' },
		{
		  Header: "Assigned Employer's Engineer",
		  Cell: ({ row }) => {
		    const assignedEngineerValue = row.original.assignedPersonClient;
		    return assignedEngineerValue ? (
		      assignedEngineerValue
		    ) : (
		      <span style={{ color: '#888' }}>---</span>
		    );
		  }
	    },
		{ Header: 'Measurement Type', accessor: 'measurementType' },
		{ Header: 'Total Qty', accessor: 'totalQty' },
		{
			Header: 'Inspection Status',
			accessor: 'inspectionStatus'
		},
		{
			Header: 'Download Contractor Images',
			Cell: ({ row }) => {
				const isDownloading = downloadingId === row.original.id;
				const hasContractorImage = row.original.imgContractor !== null;

				return hasContractorImage ? (
					<button
						onClick={() => handleDownloadSiteImagesPdf(row.original.id, 'Contractor',row.original.rfi_Id)}
						className="btn-download"
						disabled={isDownloading}
					>
						{isDownloading ? '⏳ Downloading...' : '⬇️'}
					</button>
				) : (
					<span style={{ color: '#888' }}></span>
				);
			}
		},
		{
			Header: 'Download Client Images',
			Cell: ({ row }) => {
				const isDownloading = downloadingId === `client-${row.original.id}`;
				const hasClientImage = row.original.imgClient !== null;

				return hasClientImage ? (
					<button
						onClick={() => handleDownloadSiteImagesPdf(row.original.id, 'Regular User',row.original.rfi_Id)}
						className="btn-download"
						disabled={isDownloading}
					>
						{isDownloading ? '⏳ Downloading...' : '⬇️'}
					</button>
				) : (
					<span style={{ color: '#888' }}></span>
				);
			}
		},
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
							  onClick={() => handleInspectionComplete(row.original.id, row.original.status)}
							  disabled={row.original.status === "CANCELLED"}
							  style={row.original.status === "CANCELLED" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
							>
							  Start Inspection Online
							</button>
								<button
									onClick={() => {
							    if (row.original.status !== "CANCELLED") {
										navigate('/InspectionForm', {
											state: { rfi: row.original.id, skipSelfie: false, offlineMode: true },
										});
										setOpenDropdownRow(null);
										setDropdownInfo({ rowId: null, targetRef: null });
							    }
									}}
							  disabled={row.original.status === "CANCELLED"}
							  style={row.original.status === "CANCELLED" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
								>
									Start Inspection Offline
								</button>

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

									{userRole === 'it admin' ? (
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



								)}
								<button onClick={() => setShowUploadPopup(true)}>Upload Test Results</button>
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
								Showing {pageIndex * pageSize + 1} to{' '}
								{Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length} entries
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
				
				{showUploadPopup && (
				  <div className="inspection popup-overlay" onClick={() => setShowUploadPopup(false)}>
				    <div className="upload-popup" onClick={(e) => e.stopPropagation()}>
				      <button className="close-btn" onClick={() => setShowUploadPopup(false)}>✖</button>
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
				          onClick={(e) => { e.preventDefault(); document.getElementById("uploadInput").click(); }}
				        >
				          Upload Documents 📄
				        </a>
				        <input 
				          type="file" 
				          id="uploadInput" 
				          style={{ display: "none" }}
				          onChange={(e) => setUploadedFile(e.target.files[0])}
				        />
				        {uploadedFile && <p>Uploaded: {uploadedFile.name}</p>}
				      </div>

				      <button className="done-btn" onClick={() => setShowUploadPopup(false)}>Done</button>
				    </div>
				  </div>
				)}

			</div>
		</div>
	);
};

export default Inspection;