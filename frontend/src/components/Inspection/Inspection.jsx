import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate } from 'react-router-dom';
import './Inspection.css';
import InspectionForm from '../InspectionForm/InspectionForm';
import axios from 'axios';


const DropdownMenu = ({ children }) => {
	return (
		<div className="drop-down-menu" onClick={(e) => e.stopPropagation()}>
			{children}
		</div>
	);
};


const Inspection = () => {
	const [selectedRfi, setSelectedRfi] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [assignedPersons, setAssignedPersons] = useState({});
	const [pageSize, setPageSize] = useState(5);
	const [openDropdownRow, setOpenDropdownRow] = useState(null);
	const buttonRefs = useRef({});
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [confirmPopupData, setConfirmPopupData] = useState(null);
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;


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
		const handleClickOutside = (e) => {
			const dropdowns = document.querySelectorAll('.drop-down-menu');
			const refs = Object.values(buttonRefs.current);

			const clickedInsideDropdown = Array.from(dropdowns).some((menu) =>
				menu.contains(e.target)
			);
			const clickedInsideButton = refs.some((ref) =>
				ref?.current?.contains(e.target)
			);

			if (!clickedInsideDropdown && !clickedInsideButton) {
				setOpenDropdownRow(null);
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	const handleInspectionComplete = (rfi) => {
		navigate(`/InspectionForm`, { state: { rfi } });
	};

	const [downloadingId, setDownloadingId] = useState(null);
	const handleDownloadImagesPdf = async (id, uploadedBy) => {
		const uniqueId = uploadedBy === "Contractor" ? id : `client-${id}`;
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
			const filename = `Images_Uploaded_by_the_${uploadedBy === "Contractor" ? "Contractor" : "Client"}.pdf`;
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
		{ Header: 'Inspection Status', accessor: 'inspectionStatus' },
		{
				  Header: 'Inspection Status',
				  accessor: row => {
				    const details = row.inspectionDetails;
				    if (Array.isArray(details) && details.length > 0) {
				      return details
				        .map(item => item.inspectionStatus || 'N/A')
				        .join(', ');
				    }
				    return 'N/A';
				  }
				},	
		{
			Header: 'Download Contractor Images',
			Cell: ({ row }) => {
				const isDownloading = downloadingId === row.original.id;
				return (
					<button
						onClick={() => handleDownloadImagesPdf(row.original.id, 'Contractor')}
						className="btn-download"
						disabled={isDownloading}
					>
						{isDownloading ? '⏳ Downloading...' : '⬇️'}
					</button>
				);
			}
		},
		{
			Header: 'Download Client Images',
			Cell: ({ row }) => {
				const isDownloading = downloadingId === `client-${row.original.id}`;
				return (
					<button
						onClick={() => handleDownloadImagesPdf(row.original.id, 'Regular User')}
						className="btn-download"
						disabled={isDownloading}
					>
						{isDownloading ? '⏳ Downloading...' : '⬇️'}
					</button>
				);
			}
		},
		{
			Header: 'Action',
			Cell: ({ row }) => {
				return (
					<div className="action-dropdown">
						<button
							className="action-button"
							onClick={(e) => {
								e.stopPropagation();
								setOpenDropdownRow(openDropdownRow === row.id ? null : row.id);
							}}
						>
							⋮
						</button>
						{openDropdownRow === row.id && (
							<DropdownMenu>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleInspectionComplete(row.original.id);
										setOpenDropdownRow(null);
									}}
								>
									Start Inspection Online
								</button>
								<button>Start Inspection Offline</button>

								{userRole !== 'regular user' && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											navigate('/InspectionForm', {
												state: { rfi: row.original.id, skipSelfie: true },
											});
											setOpenDropdownRow(null);
										}}
									>
										Upload Test Results
									</button>
								)}

								<button
									onClick={(e) => {
										e.stopPropagation();
										navigate('/InspectionForm', {
											state: { rfi: row.original.id, skipSelfie: true },
										});
										setOpenDropdownRow(null);
									}}
								>
									View
								</button>

								{userRole !== 'contractor' && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											setConfirmPopupData({
												message: "Do you want to Submit the Inspection report for Validation?",
												onConfirm: async () => {
													try {
														const rfiLongId = row.original.id;
														const response = await axios.put(`${API_BASE_URL}rfi/${rfiLongId}/send-for-validation`);
														alert(response.data); // or use toast if available
													} catch (error) {
														console.error("Validation submission failed:", error);
														alert("Failed to submit RFI for validation.");
													} finally {
														setOpenDropdownRow(null);
														setConfirmPopupData(null);
													}
												},
											});
										}}
									>
										Send for Validation
									</button>
								)}


								{userRole !== 'regular user' && (
									<button>Submit</button>
								)}
							</DropdownMenu>
						)}
					</div>
				);
			},
		},
	], [openDropdownRow, data]);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		prepareRow,
		state,
		setGlobalFilter,
		nextPage,
		previousPage,
		canNextPage,
		canPreviousPage,
		pageOptions,
		gotoPage,
	} = useTable(
		{
			columns,
			data,
			initialState: { pageSize },
			getRowId: (row) => row.rfi_Id,
		},
		useGlobalFilter,
		usePagination
	);

	const { pageIndex, globalFilter } = state;

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
							<button onClick={confirmPopupData.onConfirm}>Yes</button>
							<button onClick={() => setConfirmPopupData(null)}>Cancel</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Inspection;
