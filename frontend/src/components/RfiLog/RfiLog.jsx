import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import ReactDOM from 'react-dom';
import './RfiLog.css';

const DropdownMenu = ({ anchorRef, children }) => {
	const [coords, setCoords] = useState(null);



	useEffect(() => {
		if (anchorRef.current) {
			const rect = anchorRef.current.getBoundingClientRect();
			setCoords({
				top: rect.bottom + window.scrollY,
				left: rect.right - 150 + window.scrollX,
			});
		}
	}, [anchorRef]);

	if (!coords) return null;

	return ReactDOM.createPortal(
		<div className="drop-down-menu" style={{ position: 'absolute', top: coords.top, left: coords.left }}>
			{children}
		</div>,
		document.getElementById('dropdown-portal')
	);
};

const RfiLog = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedRfi, setSelectedRfi] = useState(null);
	const [assignedPersons, setAssignedPersons] = useState({});
	const [showPopup, setShowPopup] = useState(false);
	const [pageSize, setPageSize] = useState(5);
	const [openDropdownRow, setOpenDropdownRow] = useState(null);
	const buttonRefs = useRef({});
	const [personOptions, setPersonOptions] = useState([]);
	const [selectedPerson, setSelectedPerson] = useState('');
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL?.replace(/\/+$/, '');
    const [selectedDepartment, setSelectedDepartment] = useState('');



	useEffect(() => {
		const fetchRfis = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/rfi/rfi-details`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();
				const formatted = result.map((item, index) => ({
					rfiId: item.rfi_Id,
					project: item.project,
					structure: item.structure,
					element: item.element,
					activity: item.activity,
					contractor: item.createdBy,
					submissionDate: item.dateOfSubmission || '—',
					clientPerson: item.assignedPersonClient || '—',
				}));
				setData(formatted);
			} catch (error) {
				console.error("Failed to fetch RFI data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchRfis();
	}, []);


	useEffect(() => {
		const fetchRegularUsers = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/api/auth/regular-roles`);
				const users = await response.json();
				console.log('Fetched user list:', users); 
				setPersonOptions(users);
			} catch (error) {
				console.error('Failed to fetch regular users:', error);
			}
		};

		fetchRegularUsers();
	}, []);

	const handleSelect = (e) => {
	  const selectedUsername = e.target.value;
	  const userObj = personOptions.find(p => p.username === selectedUsername);
	   setSelectedPerson(userObj);
	  setSelectedDepartment(userObj?.department || '');
	};

	const handleAssignSubmit = async () => {

		const selectedRow = data.find(d => d.rfiId === selectedRfi);
		if (!selectedRow) return;
		const rfiId = selectedRow.rfiId;

		try {
			const response = await fetch(`${API_BASE_URL}/rfi/assign-client-person`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					rfi_Id: rfiId,
					assignedPersonClient: selectedPerson?.username,
					clientDepartment: selectedPerson.department,
				}),
			});

			if (response.ok) {
				// Update UI immediately
				setAssignedPersons((prev) => ({
					...prev,
					[selectedRfi]: selectedPerson?.username,
				}));
				setShowPopup(false);
				setSelectedPerson('');
			} else {
				alert("Assignment failed: " + (await response.text()));
			}
		} catch (err) {
			console.error("Error assigning person:", err);
			alert("Error assigning person");
		}
	};


	useEffect(() => {
		const handleClickOutside = (e) => {
			const refs = Object.values(buttonRefs.current);
			if (!refs.some(ref => ref?.current?.contains(e.target))) {
				setOpenDropdownRow(null);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfiId' },
		{ Header: 'Project', accessor: 'project' },
		{ Header: 'Structure', accessor: 'structure' },
		{ Header: 'Element', accessor: 'element' },
		{ Header: 'Activity', accessor: 'activity' },
		{ Header: 'Assigned Contractor', accessor: 'contractor' },
		{ Header: 'Date of Submission', accessor: 'submissionDate' },
		{
			Header: 'Assigned Person Client',
			accessor: 'clientPerson',
			Cell: ({ row }) => assignedPersons[row.id] || row.values.clientPerson || '—',
		},
		{
			Header: 'Action',
			Cell: ({ row }) => {
				const btnRef = (buttonRefs.current[row.id] ||= React.createRef());
				return (
					<div className="action-dropdown">
						<button
							ref={btnRef}
							className="action-button"
							onClick={() => setOpenDropdownRow(openDropdownRow === row.id ? null : row.id)}
						>
							⋮
						</button>
						{openDropdownRow === row.id && (
							<DropdownMenu anchorRef={btnRef}>
								<button
									onMouseDown={(e) => {
										e.preventDefault();
										setSelectedRfi(row.values.rfiId);
										setShowPopup(true);
										setOpenDropdownRow(null);
									}}
								>
									Assign RFI
								</button>
								<button>Close RFI</button>
								<button>Delete</button>
							</DropdownMenu>
						)}
					</div>
				);
			}
		}
	], [assignedPersons, selectedRfi, openDropdownRow]);

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
		gotoPage
	} = useTable(
		{
			columns,
			data,
			initialState: { pageSize },
			getRowId: row => row.rfiId,
		},
		useGlobalFilter,
		usePagination
	);

	const { pageIndex, globalFilter } = state;

	const handleAssign = (e) => {
		setAssignedPersons(prev => ({ ...prev, [selectedRfi]: e.target.value }));
	};


	if (loading) {
		return <div>Loading RFI data...</div>;
	}

	return (
		<div className="dashboard credted-rfi">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-table-container">
						<h2 className="section-heading">Rfi Created</h2>

						<div className="table-top-bar d-flex justify-content-between align-items-center">
							<div className="left-controls">
								<label>
									Show{' '}
									<select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
										{[5, 10, 20, 50].map(size => (
											<option key={size} value={size}>{size}</option>
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

						<div className="table-section">
							<div className="table-wrapper">
								<table {...getTableProps()} className="responsive-table">
									<thead>
										{headerGroups.map(group => (
											<tr {...group.getHeaderGroupProps()}>
												{group.headers.map(col => (
													<th {...col.getHeaderProps()}>{col.render('Header')}</th>
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
						</div>

						<div className="d-flex align-items-center justify-content-between">
							<span>
								Showing {pageIndex * pageSize + 1} to{' '}
								{Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length} entries
							</span>
							<div className="pagination">
								<button onClick={previousPage} disabled={!canPreviousPage}>‹</button>
								{pageOptions.map((_, i) => (
									<button
										key={i}
										onClick={() => gotoPage(i)}
										className={pageIndex === i ? 'activePage' : ''}
									>
										{i + 1}
									</button>
								))}
								<button onClick={nextPage} disabled={!canNextPage}>›</button>
							</div>
							<div></div>
						</div>

						{showPopup && (
							<div className="popup-overlay">
								<div className="popup">
									<h3>Select Person to Assign</h3>
									<select onChange={handleSelect} value={selectedPerson?.username || ''}>
										<option value="" disabled>Select</option>
										{personOptions.map((user, idx) => (
										    <option key={idx} value={user.username}>
										      {user.username}
										    </option>
										  ))}
									</select>

									<div className="rfilog-popup-btn">
										<button onClick={handleAssignSubmit}>Done</button>
									</div>
								</div>
							</div>
						)}


					</div>
				</div>
			</div>
		</div>
	);
};

export default RfiLog;
