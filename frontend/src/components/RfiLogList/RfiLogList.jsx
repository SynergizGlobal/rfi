import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import Select from 'react-select';
import './RfiLogList.css';
import HeaderRight from '../HeaderRight/HeaderRight';

export default function RfiLogList() {
	const [data, setData] = useState([]);
	const [message, setMessage] = useState('');
	const [projectOptions, setProjectOptions] = useState([]);
	const [projectIdMap, setProjectIdMap] = useState({});
	const [workOptions, setWorkOptions] = useState([]);
	const [workIdMap, setWorkIdMap] = useState({});
	const [contractOptions, setContractOptions] = useState([]);
	const [contractIdMap, setContractIdMap] = useState({});
	const [formState, setFormState] = useState({ project: '', work: '', contract: '' });
	const [allData, setAllData] = useState([]); 



	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL?.replace(/\/+$/, '');
	useEffect(() => {
		axios.get(`${API_BASE_URL}/getAllRfiLogDetails`, { withCredentials: true })
			.then(response => {
				if (response.status === 204 || !response.data || response.data.length === 0) {
					setAllData([]);
					setData([]);
					setMessage('No RFIs found.');
				} else {
					setAllData(response.data);
					setData(response.data); // show everything initially
					setMessage('');
				}
			})
			.catch(() => {
				setMessage('Error loading RFI data.');
			});
	}, []);



	useEffect(() => {
		axios.get(`${API_BASE_URL}/rfi/projectNames`)
			.then(response => {
				const map = {};
				const options = response.data.map(p => {
					map[p.projectName] = p.projectId;
					return { value: p.projectName, label: p.projectName };
				});
				setProjectOptions(options);
				setProjectIdMap(map);
			});
	}, []);

	useEffect(() => {
		const { project, work, contract } = formState;

		const filtered = allData.filter(item => {
			const matchProject = project ? item.project === project : true;
			const matchWork = work ? item.work === work : true;
			const matchContract = contract ? item.contract === contract : true;
			return matchProject && matchWork && matchContract;
		});

		setData(filtered);

		if (filtered.length === 0) {
			setMessage('No RFIs match the selected filters.');
		} else {
			setMessage('');
		}
	}, [formState, allData]);


	const processedData = useMemo(() =>
		data.map(row => ({
			...row,
			displayStatus: row.status === 'INSPECTION_DONE' ? 'Closed' : 'Open',
		})),
		[data]);



	const columns = useMemo(() => [
		{ Header: 'RFI ID', accessor: 'rfiId' },
		{ Header: 'RFI Date', accessor: 'dateOfSubmission' },
		{ Header: 'RFI Description', accessor: 'rfiDescription' },
		{ Header: 'RFI Requested By', accessor: 'rfiRequestedBy' },
		{
			Header: 'RFI Sent To',
			columns: [
				{ Header: 'Department', accessor: 'department' },
				{ Header: 'Person', accessor: 'person' }
			]
		},
		{ Header: 'Date Raised', accessor: 'dateRaised' },
		{ Header: 'Date Responded', accessor: 'dateResponded' },
		{
			Header: 'Status',
			accessor: 'displayStatus',
		},
		{ Header: 'Notes', accessor: 'notes' },
		{
			Header: 'View',
			accessor: 'view',
			Cell: ({ value }) =>
				value ? (
					<a href={value} download>
						<button className="download-btn">⬇</button>
					</a>
				) : null
		}
	], []);

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
		setPageSize
	} = useTable(
		{ columns, data: processedData, initialState: { pageSize: 5 } },
		useGlobalFilter,
		usePagination
	);

	const { pageIndex, pageSize, globalFilter } = state;

	return (
		<div className="dashboard">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-table-container">
						<h2 className="section-heading">Request For Inspection Log (Rfi Log)</h2>

						<div className="filters">
							<div className="form-row">
								<div className="form-fields flex-2">
									<label>Project:</label>
									<Select
										options={projectOptions}
										value={formState.project ? { value: formState.project, label: formState.project } : null}
										onChange={(selected) => {
											const project = selected?.value || '';
											const projectId = projectIdMap[project] || '';
											setFormState({ project, work: '', contract: '' });

											if (projectId) {
												axios.get(`${API_BASE_URL}/rfi/workNames`, { params: { projectId } })
													.then(res => {
														const map = {};
														const opts = res.data.map(w => {
															map[w.workName] = w.workId;
															return { value: w.workName, label: w.workName };
														});
														setWorkOptions(opts);
														setWorkIdMap(map);
													});
											}
										}}
									/>
								</div>

								<div className="form-fields flex-2">
									<label>Work:</label>
									<Select
										options={workOptions}
										value={formState.work ? workOptions.find(w => w.value === formState.work) : null}
										onChange={(selected) => {
											const work = selected?.value || '';
											const workId = workIdMap[work] || '';
											setFormState(prev => ({ ...prev, work, contract: '' }));

											if (workId) {
												axios.get(`${API_BASE_URL}/rfi/contractNames`, { params: { workId } })
													.then(res => {
														const map = {};
														const opts = res.data.map(c => {
															map[c.contractShortName] = c.contractIdFk.trim();
															return { value: c.contractShortName, label: c.contractShortName };
														});
														setContractOptions(opts);
														setContractIdMap(map);
													});
											}
										}}
									/>
								</div>

								<div className="form-fields flex-2">
									<label>Contract:</label>
									<Select
										options={contractOptions}
										value={formState.contract ? contractOptions.find(c => c.value === formState.contract) : null}
										onChange={(selected) => {
											const contract = selected?.value || '';
											setFormState(prev => ({ ...prev, contract }));
										}}
									/>
								</div>

							</div>
						</div>


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
							<div className="reset-button-wrapper">
								<button
									className="reset-button"
									onClick={() => {
										setFormState({ project: '', work: '', contract: '' });
										setWorkOptions([]);
										setContractOptions([]);
										axios.get(`${API_BASE_URL}/getAllRfiLogDetails`, { withCredentials: true })
											.then(response => {
												if (response.status === 204 || !response.data || response.data.length === 0) {
													setData([]);
													setMessage('No RFIs found.');
												} else {
													setData(response.data);
													setMessage('');
												}
											})
											.catch(() => {
												setMessage('Error loading RFI data.');
											});
									}}
								>
									Reset Filters
								</button>
							</div>

						</div>


						<div className="table-scroll-wrapper">
							<table {...getTableProps()} className="validation-table datatable" border={1}>
								<thead>
									{headerGroups.map((group, i) => (
										<tr {...group.getHeaderGroupProps()} key={i}>
											{group.headers.map((column, idx) => (
												<th {...column.getHeaderProps()} key={idx}>{column.render('Header')}</th>
											))}
										</tr>
									))}
								</thead>
								<tbody {...getTableBodyProps()}>
									{message ? (
										<tr>
											<td colSpan={columns.length} className="message-cell">{message}</td>
										</tr>
									) : (
										page.map((row, i) => {
											prepareRow(row);
											return (
												<tr {...row.getRowProps()} key={i}>
													{row.cells.map((cell, idx) => (
														<td {...cell.getCellProps()} key={idx}>{cell.render('Cell')}</td>
													))}
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>


						<div className="pagination-bar">
							<span>
								Showing {pageIndex * pageSize + 1} to{' '}
								{Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length} entries
							</span>
							<button onClick={() => previousPage()} disabled={!canPreviousPage}>&lt; Prev</button>
							<span>Page <strong>{pageIndex + 1} of {pageOptions.length}</strong></span>
							<button onClick={() => nextPage()} disabled={!canNextPage}>Next &gt;</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
