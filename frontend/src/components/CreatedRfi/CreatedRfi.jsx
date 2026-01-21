import React, { useMemo, useState, useEffect } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { useNavigate } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import './CreatedRfi.css';
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom";

const CreatedRfi = () => {
	const [rfiData, setRfiData] = useState([]);
	const navigate = useNavigate();
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

	const location = useLocation();
	const filterStatus = location.state?.filterStatus || [];

	const [allRfis, setAllRfis] = useState([]);
	
	const [showDeletePopup, setShowDeletePopup] = useState(false);
	const [deleteReason, setDeleteReason] = useState("");
	const [selectedDeleteRow, setSelectedDeleteRow] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);



	const fetchRfiData = () => {
		fetch(`${API_BASE_URL}rfi/rfi-details`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP ${response.status} - ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				const transformed = data.map((item) => ({
					id: item.id,
					rfiId: item.rfi_Id,
					project: item.project,
					structure: item.structure,
					element: item.element,
					activity: item.activity,
					assignedPerson: item.createdBy,
					submissionDate: item.dateOfSubmission || "",
					status: item.status,
					nameOfRepresentative: item.nameOfRepresentative,
				}));

				if (filterStatus.length > 0) {
					const filtered = transformed.filter((item) =>
						filterStatus.includes(item.status)
					);
					setRfiData(filtered);
				} else {
					setRfiData(transformed);
				}
			})
			.catch((error) => {
				console.error("❌ Error fetching RFI data:", error);
				alert("Failed to fetch RFI data. Please check if you are logged in.");
			});
	};

	
	useEffect(() => {
		fetchRfiData();
	}, []);



	const filteredRfis = allRfis.filter((rfi) =>
		filterStatus.includes(rfi.status)
	);


	const handleEdit = (rfi) => {
		console.log("🟢 rfi object:", rfi);
		navigate('/CreateRfi', {
			state: {
				id: rfi.id,
				status: rfi.status,
				mode: 'edit'
			}
		});
		console.log("Navigating to edit with:", { rfiId: rfi.rfiId, status: rfi.status, mode: 'edit' });
	};
	


	const handleDelete = (rowObj) => {
		setSelectedDeleteRow(rowObj);
		setDeleteReason("");
		setShowDeletePopup(true);
	};

	const closeDeletePopup = () => {
		setShowDeletePopup(false);
		setDeleteReason("");
		setSelectedDeleteRow(null);
	};

	
	const confirmDelete = async () => {
	  if (!deleteReason.trim()) {
	    alert("Please enter reason for delete");
	    return;
	  }

	  try {
	    setDeleteLoading(true);

	    const deleteId = selectedDeleteRow?.id;

	    const url = `${API_BASE_URL}rfi/delete`;

	    const res = await fetch(url, {
	      method: "DELETE",
	      credentials: "include",
	      headers: {
	        "Content-Type": "application/json",
	      },
	      body: JSON.stringify({
	        id: deleteId,
	        description: deleteReason,
	      }),
	    });

	    const msg = await res.text();

	    if (!res.ok) {
	      alert(msg || "Delete failed");
	      return;
	    }

	    alert(msg);
	    fetchRfiData();

	    closeDeletePopup();
	  } catch (err) {
	    console.error(err);
	    alert("Something went wrong! Please try after some time.");
	  } finally {
	    setDeleteLoading(false);
	  }
	};


	
	const deleteModalContent = (
		<div
			className="popup-modal-rfi-loglist bg-black bg-opacity-50 z-50"
			onClick={closeDeletePopup}
		>
			<div
				className="popup-modal-inner bg-white rounded-xl shadow-lg p-4 max-w-md w-full"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="text-lg font-semibold mb-2">Delete RFI</h2>

				<label className="text-sm font-medium text-gray-700">
					Reason for delete
				</label>

				<textarea
					value={deleteReason}
					onChange={(e) => setDeleteReason(e.target.value)}
					rows={4}
					className="form-control mt-1"
					placeholder="Enter reason..."
				/>

				<div className="d-flex justify-content-end gap-2 mt-3">
					<button
						onClick={closeDeletePopup}
						className="btn btn-white"
						disabled={deleteLoading}
					>
						Close
					</button>

					<button
						onClick={confirmDelete}
						className="btn btn-danger"
						disabled={deleteLoading}
					>
						{deleteLoading ? "Deleting..." : "Confirm Delete"}
					</button>
				</div>
			</div>
		</div>
	);

	

	const userDepartment = localStorage.getItem("departmentFk");
	const userRole = localStorage.getItem("userRoleNameFk");
	const userType = localStorage.getItem("userTypeFk");


	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfiId' },
		{ Header: 'Project', accessor: 'project' },
		{ Header: 'Structure', accessor: 'structure' },
		{ Header: 'Element', accessor: 'element' },
		{ Header: 'Activity', accessor: 'activity' },
		{ Header: 'Assigned Contractor', accessor: 'nameOfRepresentative' },
		{ Header: 'Assigned Person', accessor: 'assignedPerson' },
		{ Header: 'Submission Date', accessor: 'submissionDate' },
		{ Header: 'Status', accessor: 'status' },
		{
			Header: 'Actions',
			id: 'actions',
			Cell: ({ row }) => {
				const isEngineer = userDepartment?.toLowerCase() === "engg";
				const isContractorRep =
	userType?.toLowerCase().trim() === "contractor rep";

const disableActions = isEngineer || isContractorRep;

				return (
					<div className="action-buttons">
						<button
							className="edit-btn"
							onClick={() => handleEdit(row.original)}
							disabled={disableActions}
							style={disableActions ? { opacity: 0.5, cursor: "not-allowed" } : {}}
						>
							Edit
						</button>
						<button
							className="delete-btn"
							onClick={() => handleDelete(row.original)}
							disabled={disableActions}
							style={disableActions ? { opacity: 0.5, cursor: "not-allowed" } : {}}
						>
							Delete
						</button>
					</div>
				);
			},
		},
	], [userDepartment]);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		prepareRow,
		nextPage,
		previousPage,
		canNextPage,
		canPreviousPage,
		pageOptions,
		state,
		setGlobalFilter,
		setPageSize,
		gotoPage,
	} = useTable(
		{ columns, data: rfiData, initialState: { pageSize: 5 } },
		useGlobalFilter,
		usePagination
	);

	const { pageIndex, globalFilter, pageSize } = state;

	return (
		<div className="dashboard">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-table-container">
						<h2 className="section-heading">CREATED RFI LIST</h2>

						<div className="table-top-bar d-flex justify-content-between align-items-center">
							<div className="left-controls">
								<label>
									Show{' '}
									<select
										value={pageSize}
										onChange={e => setPageSize(Number(e.target.value))}
									>
										{[5, 10, 20, 50].map(size => (
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
									onChange={e => setGlobalFilter(e.target.value)}
									placeholder="Search RFI..."
								/>
							</div>
						</div>
						<div className="table-scroll-wrapper">
							<table {...getTableProps()} className="rfi-table datatable" border={1}>
								<thead>
									{headerGroups.map(group => (
										<tr {...group.getHeaderGroupProps()}>
											{group.headers.map(column => (
												<th {...column.getHeaderProps()}>{column.render('Header')}</th>
											))}
										</tr>
									))}
								</thead>
								<tbody {...getTableBodyProps()}>
									{page.map(row => {
										prepareRow(row);
										return (
											<tr {...row.getRowProps()}>
												{row.cells.map(cell => (
													<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
												))}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						<div className="pagination-bar">
							<button onClick={() => previousPage()} disabled={!canPreviousPage}>
								&lt; Prev
							</button>
							<span>
								Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
							</span>
							<button onClick={() => nextPage()} disabled={!canNextPage}>
								Next &gt;
							</button>
						</div>
					</div>
				</div>
			</div>
			
			{showDeletePopup &&
				ReactDOM.createPortal(
					deleteModalContent,
					document.querySelector(".dashboard")
				)}

		</div>
	);
};

export default CreatedRfi;
