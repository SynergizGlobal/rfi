import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate } from 'react-router-dom';
import './Inspection.css';
import InspectionForm from '../InspectionForm/InspectionForm';
import DropdownPortal from '../DropdownPortal/DropdownPortal';
import axios from 'axios';
import { saveOfflineInspection, saveOfflineEnclosure, getAllOfflineEnclosures, getAllOfflineInspections, removeOfflineInspection, removeOfflineEnclosure, clearOfflineEnclosures } from '../../utils/offlineStorage';


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

	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();


	useEffect(() => {
		fetch(`${API_BASE_URL}rfi/rfi-details`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error("Network error");
				}
				return res.json();
			})
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setError("Failed to load RFI data");
				setLoading(false);
			});
	}, []);

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



	const handleInspectionComplete = (rfi, status) => {

		if (status === "INSPECTION_DONE") {
			alert("Inspection is already closed. Further inspection not allowed.")
		}
		const deptFK = localStorage.getItem("departmentFk")?.toLowerCase();

		if (deptFK === "engg") {
			const allowedStatuses = ["INSPECTED_BY_CON", "INSPECTED_BY_ENGINEER",];
			if (!allowedStatuses.includes(status)) {
				alert("Inspection not allowed until Contractor completes inspection.");
				return;
			}
		}
		navigate(`/InspectionForm`, { state: { rfi } });
	};


	const [downloadingId, setDownloadingId] = useState(null);
	const handleDownloadImagesPdf = async (id, uploadedBy) => {
		const uniqueId = uploadedBy === "Con" ? id : `client-${id}`;
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
			const filename = `Images_Uploaded_by_the_${uploadedBy === "Con" ? "Con" : "Client"}.pdf`;
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


	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfi_Id' },
		{ Header: 'Project', accessor: 'project' },
		{ Header: 'Structure', accessor: 'structure' },
		{ Header: 'Element', accessor: 'element' },
		{ Header: 'Activity', accessor: 'activity' },
		{ Header: 'Assigned Contractor', accessor: 'createdBy' },
		{ Header: 'Assigned Person Client', accessor: 'assignedPersonClient' },
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
						onClick={() => handleDownloadImagesPdf(row.original.id, 'Contractor')}
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
						onClick={() => handleDownloadImagesPdf(row.original.id, 'Regular User')}
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
								<button onClick={() => handleInspectionComplete(row.original.id, row.original.status)}>Start Inspection Online</button>
								<button
									onClick={() => {
										navigate('/InspectionForm', {
											state: { rfi: row.original.id, skipSelfie: false, offlineMode: true },
										});
										setOpenDropdownRow(null);
										setDropdownInfo({ rowId: null, targetRef: null });
									}}
								>
									Start Inspection Offline
								</button>
								{	/*	{userRole !== 'Engg' && (
									<button
										onClick={() => {
											navigate('/InspectionForm', {
												state: { rfi: row.original.id, skipSelfie: true },
											});
											setOpenDropdownRow(null);
											setDropdownInfo({ rowId: null, targetRef: null });
										}}
									>
										Upload Test Results
									</button>
								)}*/}

								{deptFK.toLowerCase() === 'engg' &&
									row.original.status === 'INSPECTED_BY_AE' &&
									row.original.approvalStatus?.toLowerCase() === 'accepted' && (
										<button
											onClick={() => {
												console.log("📌 Send for Validation clicked for RFI:", row.original.id);
												console.log("📌 deptFK:", deptFK);

												setConfirmPopupData({
													message: "Are you sure you want to send this RFI for validation?",
													rfiId: row.original.id, // ✅ correct numeric id
													onConfirm: (id) => {
														console.log("📌 Confirming send-for-validation for id:", id);

														fetch(`${API_BASE_URL}send-for-validation/${id}`, {
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
								{userRole !== 'engg' && (
									<button
										disabled={!completedOfflineInspections[row.original.id]}  // ✅ enable only if offline completed
										onClick={() => {
											// call your submit logic
											console.log("Submitting inspection for", row.original.id);
										}}
									>
										Submit
									</button>
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
						<h2 className="section-heading">Inspection List</h2>

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
									‹
								</button>
								{pageOptions.map((_, i) => (
									<button
										key={i}
										onClick={() => gotoPage(i)}
										className={pageIndex === i ? 'activePage' : ''}
									>
										{i + 1}
									</button>
								))}
								<button onClick={nextPage} disabled={!canNextPage}>
									›
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
							<button onClick={() => confirmPopupData.onConfirm(confirmPopupData.rfiId)}>
								Yes
							</button>
							<button onClick={() => setConfirmPopupData(null)}>Cancel</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Inspection;