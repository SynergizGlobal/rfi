import React, { useMemo, useState, useEffect } from "react";
import HeaderRight from "../HeaderRight/HeaderRight";
import Select from "react-select";
import axios from "axios";
import "./ReferenceForm.css";

const ReferenceForm = () => {

	const [pageSize, setPageSize] = useState(10);
	const [tableData, setTableData] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [globalFilter, setGlobalFilter] = useState("");

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

	const [openEnclosers, setOpenEnclosers] = useState([]);
	const [activities, setActivities] = useState([]);

	const pmisCalcOptions = ["Measure", "Percent", "No", "Yes"];

	/* ---------------- PMIS OPTIONS ---------------- */

	const addPmisCalcOptions = useMemo(() =>
		pmisCalcOptions.map(opt => ({
			value: opt,
			label: opt
		}))
		, []);

	/* ---------------- ACTIVITY OPTIONS ---------------- */

	const activityOptions = useMemo(() =>
		activities.map(act => ({
			value: act,
			label: act
		}))
		, [activities]);

	/* ---------------- ENCLOSURE OPTIONS ---------------- */

	const addRfiEnclosuresOptions = useMemo(() =>
		openEnclosers.map(encl => ({
			value: encl.encloserName,
			label: encl.encloserName
		}))
		, [openEnclosers]);

	/* ---------------- FETCH ENCLOSURES ---------------- */

	useEffect(() => {
		axios
			.get(`${API_BASE_URL}api/v1/enclouser/names`, { params: { action: "OPEN" } })
			.then(res => setOpenEnclosers(res.data))
			.catch(err => console.error("Error fetching enclosure names:", err));
	}, [API_BASE_URL]);

	/* ---------------- FETCH ACTIVITIES ---------------- */

	useEffect(() => {
		axios
			.get(`${API_BASE_URL}rfi/get-activitey-names`)
			.then(res => {
				if (res.data.ActivityList) {
					setActivities(res.data.ActivityList);
				}
			})
			.catch(err => console.error("Error fetching activities:", err));
	}, [API_BASE_URL]);

	/* ---------------- FETCH TABLE DATA ---------------- */

	useEffect(() => {

		fetch(`${API_BASE_URL}rfi/Referenece-Form`)
			.then(res => res.json())
			.then(data => {

				const withSrNo = data.map((row, i) => ({
					...row,
					sr_no: i + 1,
					enclosures: row.enclosures
						? row.enclosures.split(',').map(s => s.trim())
						: [],
					pmisCalc: row.pmisCalc || "",
					isNew: false,
					isEditing: false
				}));

				setTableData(withSrNo);

			})
			.catch(err => console.error("Error fetching data:", err));

	}, [API_BASE_URL]);

	/* ---------------- ADD ROW ---------------- */

	const handleAddRow = () => {

		const newRow = {
			sr_no: tableData.length + 1,
			activity: "",
			rfiDescription: "",
			enclosures: [],
			pmisCalc: "",
			isNew: true,
			isEditing: false
		};

		setTableData(prev => [...prev, newRow]);
		setCurrentPage(Math.ceil((tableData.length + 1) / pageSize));

	};

	/* ---------------- SEARCH FILTER ---------------- */

	const filteredData = useMemo(() => {

		const filter = globalFilter.toLowerCase();

		return tableData.filter(row =>
			(row.activity || "").toLowerCase().includes(filter) ||
			(row.rfiDescription || "").toLowerCase().includes(filter) ||
			(row.pmisCalc || "").toLowerCase().includes(filter) ||
			(row.enclosures || []).join(',').toLowerCase().includes(filter)
		);

	}, [tableData, globalFilter]);

	/* ---------------- PAGINATION ---------------- */

	const paginatedData = useMemo(() => {

		const start = (currentPage - 1) * pageSize;

		return filteredData.slice(start, start + pageSize);

	}, [filteredData, currentPage, pageSize]);

	const totalPages = Math.ceil(filteredData.length / pageSize);

	/* ---------------- INPUT CHANGE ---------------- */

	const handleInputChange = (sr_no, field, value) => {

		setTableData(prev =>
			prev.map(row =>
				row.sr_no === sr_no ? { ...row, [field]: value } : row
			));

	};

	/* ---------------- EDIT MODE ---------------- */

	const handleAction = (sr_no) => {

		setTableData(prev =>
			prev.map(row =>
				row.sr_no === sr_no ? { ...row, isEditing: true } : row
			));

	};

	/* ---------------- SUBMIT ---------------- */

	const handleSubmit = async (rowData) => {

		try {

			const response = await fetch(`${API_BASE_URL}rfi/send-data`, {

				method: "POST",

				headers: { "Content-Type": "application/json" },

				body: JSON.stringify({

					activity: rowData.activity,

					rfiDescription: rowData.rfiDescription,

					enclosures: Array.isArray(rowData.enclosures)
						? rowData.enclosures.join(',')
						: rowData.enclosures,

					pmisCalc: rowData.pmisCalc

				})

			});

			if (response.ok) {

				const saved = await response.json();

				setTableData(prev =>
					prev.map(r =>
						r.sr_no === rowData.sr_no
							? { ...r, id: saved.id, isNew: false }
							: r
					));

				alert("Row submitted successfully!");

			}

		} catch (err) {
			console.error(err);
		}

	};

	/* ---------------- UPDATE ---------------- */

	const handleEdit = async (rowData) => {

		if (!rowData.id) {
			alert("Row not in DB yet");
			return;
		}

		try {

			const response = await fetch(`${API_BASE_URL}rfi/Update/${rowData.id}`, {

				method: "PUT",

				headers: { "Content-Type": "application/json" },

				body: JSON.stringify({

					activity: rowData.activity,

					rfiDescription: rowData.rfiDescription,

					enclosures: Array.isArray(rowData.enclosures)
						? rowData.enclosures.join(',')
						: rowData.enclosures,

					pmisCalc: rowData.pmisCalc

				})

			});

			if (response.ok) {

				setTableData(prev =>
					prev.map(r =>
						r.sr_no === rowData.sr_no ? { ...r, isEditing: false } : r
					));

				alert("Row updated successfully!");

			}

		} catch (err) {
			console.error(err);
		}

	};

	/* ---------------- UI ---------------- */

	return (

		<div className="dashboard credted-rfi inspection">

			<HeaderRight />

			<div className="right">

				<div className="dashboard-main">

					<div className="rfi-table-container">

						<h2 className="section-heading">Reference Form</h2>

						{/* TOP BAR */}

						<div className="table-top-bar d-flex justify-content-between align-items-center">

							<label>

								Show

								<select

									value={pageSize}

									onChange={(e) => {

										setPageSize(Number(e.target.value));

										setCurrentPage(1);

									}}

								>

									{[5, 10, 20].map(size => (

										<option key={size} value={size}>{size}</option>

									))}

								</select>

								entries

							</label>

							<div>

								<input

									className="search-input"

									value={globalFilter}

									onChange={e => setGlobalFilter(e.target.value)}

									placeholder="Search RFI..."

								/>

								<button className="btn btn-success btn-sm" onClick={handleAddRow}>

									Add Row

								</button>

							</div>

						</div>

						{/* TABLE */}

						<div className="table-wrapper">

							<table className="responsive-table">

								<thead>

									<tr>

										<th>Sr No</th>

										<th>Activity</th>

										<th>RFI Description</th>

										<th>Enclosures</th>

										<th>PMIS Calc</th>

										<th>Action</th>

									</tr>

								</thead>

								<tbody>

									{paginatedData.map(row => (

										<tr key={row.sr_no}>

											<td>{row.sr_no}</td>

											{/* ACTIVITY */}

											<td>

												{row.isNew || row.isEditing ? (

													<Select

														options={activityOptions}

														value={activityOptions.find(opt => opt.value === row.activity)}

														onChange={opt => handleInputChange(row.sr_no, "activity", opt?.value || "")}

														placeholder="Select Activity"

													/>

												) : (row.activity)}

											</td>

											{/* DESCRIPTION */}

											<td>

												{row.isNew || row.isEditing ? (

													<input

														value={row.rfiDescription}

														onChange={e => handleInputChange(row.sr_no, "rfiDescription", e.target.value)}

													/>

												) : (row.rfiDescription)}

											</td>

											{/* ENCLOSURES */}

											<td>

												{row.isNew || row.isEditing ? (

													<Select

														isMulti

														options={addRfiEnclosuresOptions}

														value={addRfiEnclosuresOptions.filter(opt =>

															(row.enclosures || []).includes(opt.value)

														)}

														onChange={opts =>

															handleInputChange(

																row.sr_no,

																"enclosures",

																opts ? opts.map(o => o.value) : []

															)

														}

														placeholder="Select enclosures"

													/>

												) : (row.enclosures.join(", "))}

											</td>

											{/* PMIS */}

											<td>

												{row.isNew || row.isEditing ? (

													<Select

														options={addPmisCalcOptions}

														value={addPmisCalcOptions.find(opt => opt.value === row.pmisCalc)}

														onChange={opt => handleInputChange(row.sr_no, "pmisCalc", opt?.value || "")}

														placeholder="Select PMIS"

													/>

												) : (row.pmisCalc)}

											</td>

											{/* ACTION */}

											<td>

												<button

													className="btn btn-sm btn-primary"

													onClick={() => {

														if (row.isNew) handleSubmit(row);

														else if (row.isEditing) handleEdit(row);

														else handleAction(row.sr_no);

													}}

												>

													{row.isNew ? "Submit" : row.isEditing ? "Save" : "Edit"}

												</button>

											</td>

										</tr>

									))}

								</tbody>

							</table>

						</div>

						{/* PAGINATION */}

						<div className="pagination-bar">

							<button

								onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}

								disabled={currentPage === 1}

							>

								Prev

							</button>

							<span>

								Page {currentPage} of {totalPages}

							</span>

							<button

								onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}

								disabled={currentPage === totalPages}

							>

								Next

							</button>

						</div>

					</div>

				</div>

			</div>

		</div>

	);

};

export default ReferenceForm;