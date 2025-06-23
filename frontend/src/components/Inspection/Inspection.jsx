import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import './Inspection.css';
import InspectionForm from '../InspectionForm/InspectionForm';

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
		<div
			className="drop-down-menu"
			style={{ position: 'absolute', top: coords.top, left: coords.left }}
			onClick={(e) => e.stopPropagation()}
		>
			{children}
		</div>,
		document.getElementById('dropdown-portal')
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

	useEffect(() => {
		fetch("http://localhost:8000/rfi/rfi-details")
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


	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfi_Id' },
		{ Header: 'Project', accessor: 'project' },
		{ Header: 'Structure', accessor: 'structure' },
		{ Header: 'Element', accessor: 'element' },
		{ Header: 'Activity', accessor: 'activity' },
		{ Header: 'Assigned Contractor', accessor: 'createdBy' },
		{ Header: 'Assigned Person Client', accessor: 'assignedPersonClient' },
		{ Header: 'Inspection Status', accessor: 'inspectionStatus' },
		{ Header: 'Images uploaded by the Contractor', accessor: 'contractorImages' },
		{ Header: 'Images uploaded by the Client', accessor: 'clientImages' },
		{
			Header: 'Action',
			Cell: ({ row }) => {
				const btnRef = (buttonRefs.current[row.rfi_Id] ||= React.createRef());
				return (
					<div className="action-dropdown">
						<button
							ref={btnRef}
							className="action-button"
							onClick={(e) => {
								e.stopPropagation();
								setOpenDropdownRow(openDropdownRow === row.id ? null : row.id);
							}}
						>
							⋮
						</button>
						{openDropdownRow === row.id && (
							<DropdownMenu anchorRef={btnRef}>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleInspectionComplete(row.original.rfi_Id);
										setOpenDropdownRow(null);
									}}
								>
									Start Inspection Online
								</button>
								<button>Start Inspection Offline</button>
								<button>Upload Test Results</button>
								<button>View</button>
								<button>Submit</button>
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
		<div className="dashboard credted-rfi">
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
			</div>
		</div>
	);
};

export default Inspection;
