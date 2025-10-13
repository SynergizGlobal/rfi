import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import axios from "axios";
import HeaderRight from "../HeaderRight/HeaderRight";
import Select from 'react-select';
import './InspectionReferenceForm.css';
import ReferenceForm from "../ReferenceForm/ReferenceForm";

const InspectionReferenceForm = () => {
	const [pageSize, setPageSize] = useState(10);
	const [selectedOption, setSelectedOption] = useState(""); // first dropdown
	const [subOption, setSubOption] = useState(""); // sub dropdown (dynamic)
	const [subOptionId, setSubOptionId] = useState(""); // store the ID of selected enclosure
	const [openEnclosers, setOpenEnclosers] = useState([]); // for RFI Enclosure List table
	const [enclosureList, setEnclosureList] = useState([]); // sub dropdown options
	const [checklistItems, setChecklistItems] = useState([]); // checklist table rows
	const [newDescription, setNewDescription] = useState(""); // for adding new description
	const [editingId, setEditingId] = useState(null); // track which row is being edited
	const [editDescription, setEditDescription] = useState(""); // for editing description
	const [editingEnclosureId, setEditingEnclosureId] = useState(null);
	const [editInputs, setEditInputs] = useState({});
	const [firstPageIndex, setFirstPageIndex] = useState(0);
	const [firstSearchInput, setFirstSearchInput] = useState("");
	const [firstGlobalFilter, setFirstGlobalFilter] = useState("");
	const [secondPageIndex, setSecondPageIndex] = useState(0);
	const [secondGlobalFilter, setSecondGlobalFilter] = useState("");
	const [secondSearchInput, setSecondSearchInput] = useState("");
	const [thirdTableData, setThirdTableData] = useState([]);
	const [thirdCurrentPage, setThirdCurrentPage] = useState(1);
	const [thirdGlobalFilter, setThirdGlobalFilter] = useState("");
	const [thirdEditInputs, setThirdEditInputs] = useState({});
	const [thirdPageIndex, setThirdPageIndex] = useState(0);
	const [thirdEditingSrNo, setThirdEditingSrNo] = useState(null);
	const [thirdSearchInput, setThirdSearchInput] = useState('');
	const [tableData, setTableData] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

	const newRowRef = useRef(null);

	useEffect(() => {
  if (selectedOption === "first") {
    axios
      .get(`${API_BASE_URL}api/v1/enclouser/enclosure_list`) // ✅ fetch all
      .then((res) => {
        setOpenEnclosers(res.data); // set all enclosures
      })
      .catch((err) => console.error("Error fetching all enclosures:", err));
  }
}, [selectedOption, API_BASE_URL]);


	useEffect(() => {
		if (selectedOption === "second") {
			axios
				.get(`${API_BASE_URL}api/v1/enclouser/by-action`)
				.then((res) => {
					console.log("Enclosure API Data:", res.data);

					// Ensure response is always an array
					if (Array.isArray(res.data)) {
						setEnclosureList(res.data);
					} else {
						setEnclosureList([]);
						console.error("Invalid API response format:", res.data);
					}
				})
				.catch((err) => {
					console.error("Error fetching enclosure list:", err);
					setEnclosureList([]);
				});
		}
	}, [selectedOption, API_BASE_URL]);

	useEffect(() => {
		axios.get("http://localhost:8000/rfi/open")
			.then(res => setOpenEnclosers(res.data))
			.catch(err => console.error("Error fetching enclosers:", err));
	}, []);

	useEffect(() => {
		if (selectedOption === "second" && subOptionId) {
			fetchChecklistItems();
		}
	}, [selectedOption, subOptionId, API_BASE_URL]);

	const fetchChecklistItems = () => {
		axios
			.get(`${API_BASE_URL}api/v1/enclouser/get/${subOptionId}`)
			.then((res) => {
				const checklistItems = res.data.map((item, index) => ({
					id: item.id,
					sno: index + 1,
					description: item.checklistDescription || "No description available",
				}));
				setChecklistItems(checklistItems);
				setSecondPageIndex(0);
			})
			.catch((err) => {
				console.error("Error fetching checklist:", err);
			});
	};

	const handleAddDescription = () => {
		if (!newDescription.trim()) {
			alert("Please enter a description");
			return;
		}
		const dto = { checkListDescription: newDescription };
		axios
			.post(`${API_BASE_URL}api/v1/enclouser/addDesctiption/${subOptionId}`, dto)
			.then((res) => {
				setNewDescription("");
				fetchChecklistItems(); // Refresh the list

			})
			.catch((err) => {
				console.error("Error adding description:", err);
				console.error("Error response:", err.response?.data);
				alert("Error adding description");
			});
	};

	const handleUpdateDescription = (id) => {
		if (!editDescription.trim()) {
			alert("Please enter a description");
			return;
		}
		const dto = { checkListDescription: editDescription };
		axios
			.put(`${API_BASE_URL}api/v1/enclouser/update/${id}`, dto)
			.then((res) => {
				setEditingId(null);
				setEditDescription("");
				fetchChecklistItems();
			})
			.catch((err) => {
				console.error("Error updating description:", err);
				console.error("Error response:", err.response?.data);
				alert("Error updating description");
			});
	};

	const handleDeleteDescription = (id) => {
		if (window.confirm("Are you sure you want to delete this description?")) {
			setChecklistItems(prevItems => prevItems.filter(item => item.id !== id));
			axios
				.delete(`${API_BASE_URL}api/v1/enclouser/delete/${id}`)
				.then((res) => {
					fetchChecklistItems();
					alert("Description deleted successfully!");
				})
				.catch((err) => {
					console.error("Error deleting description:", err);
					// If delete fails, revert the UI change
					fetchChecklistItems();
					alert("Error deleting description");
				});
		}
	};

	const startEditing = (item) => {
		setEditingId(item.id);
		setEditDescription(item.description);
	};

	const cancelEditing = () => {
		setEditingId(null);
		setEditDescription("");
	};

	const handleSubOptionChange = (e) => {
		const selectedId = e.target.value;
		setSubOptionId(selectedId);

		const selectedEnclosure = enclosureList.find(
			(enc) => String(enc.id) === String(selectedId)
		);

		setSubOption(selectedEnclosure?.encloserName || "");
	};

	// Table 2: Checklist Description Columns

	const table2Columns = useMemo(
		() => [
			{ Header: "S. No", accessor: "sno" },
			{ Header: "Reference Description", accessor: "description" },
			{
				Header: "Actions",
				accessor: "actions",
				Cell: ({ row }) => (
					<div className="irf-action-buttons">
						<button
							className="irf-btn-edit"
							onClick={() => startEditing(row.original)}
						>
							Edit
						</button>
						<button
							className="irf-btn-delete"
							onClick={() => handleDeleteDescription(row.original.id)}
						>
							Delete
						</button>
					</div>
				),
			},
		],
		[]
	);


	/*// third table scripts

	const addRfiEnclosuresOptions = useMemo(
	  () =>
		openEnclosers.map((encl) => ({
		  value: encl.encloserName,
		  label: encl.encloserName,
		})),
	  [openEnclosers]
	);*/



	// Table 1: RFI Enclosure List Data & Columns

	const table1Data = useMemo(
		() => openEnclosers.map((item, idx) => ({
			...item,
			sr_no: idx + 1,
			enclosure_name: item.encloserName,
		})),
		[openEnclosers]
	);

	const EditableCell = React.memo(({ value, onChange, inputRef }) => {
		useEffect(() => {
			if (inputRef && inputRef.current) {
				inputRef.current.focus();
			}
		}, [inputRef]);

		return (
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={onChange}
				placeholder="Enter enclosure name"
				classname="irf-description-input"
			/>
		);
	});

	const handleEditClick = (row) => {
		setEditingEnclosureId(row.id);
		setEditInputs(prev => ({
			...prev,
			[row.id]: row.encloserName // prefill input
		}));
	};

	const handleInputChange = React.useCallback((id, e) => {
		const { value } = e.target;
		setEditInputs(inputs => ({ ...inputs, [id]: value }));
	}, []);

	const table1Columns = useMemo(() => [
		{ Header: "Sr No", accessor: "sr_no" },
		{
			Header: "Enclosure Name",
			accessor: "enclosure_name",
			Cell: ({ row }) => {
				const id = row.original.id;
				const isEditing = id === editingEnclosureId;
				return isEditing ? (
					<EditableCell
						value={editInputs[id] ?? ""}
						onChange={(e) => handleInputChange(id, e)}
						inputRef={newRowRef}
					/>
				) : (
					row.original.encloserName || ""
				);
			},
		},
		{
			Header: "Action Type",
			accessor: "action", // matches backend field
			Cell: ({ row }) => {
				const id = row.original.id;
				const isEditing = id === editingEnclosureId;

				return isEditing ? (
					<select
						value={editInputs[`${id}_action`] ?? row.original.action ?? ""}
						onChange={(e) =>
							setEditInputs((prev) => ({
								...prev,
								[`${id}_action`]: e.target.value,
							}))
						}
						className="form-select"
						style={{ minWidth: "120px" }}
					>
						<option value="">Select</option>
						<option value="Open">Open</option>
						<option value="Upload">Upload</option>
					</select>
				) : (
					row.original.action || ""
				);
			},
		},

		{
			Header: "Action",
			accessor: "action_type",
			Cell: ({ row }) => {
				const id = row.original.id;
				const isEditing = id === editingEnclosureId;

				return isEditing ? (
					<div className="irf-edit-inline">
						<button
							onClick={() => handleSubmitRow(id)}
							className="irf-btn-save btn btn-primary"
						>
							Save
						</button>
						<button
							onClick={() => cancelEditingNewRow(id)}
							className="irf-btn-cancel btn btn-white"
						>
							Cancel
						</button>
					</div>
				) : (
					<div className="irf-action-buttons">
						<button
							onClick={() => handleEditClick(row.original)}
							className="irf-btn-edit"
						>
							Edit
						</button>
						<button
							onClick={() => handleDeleteRow(row.original.id)}
							className="irf-btn-delete"
						>
							Delete
						</button>
					</div>
				);
			},
		},
	], [editingEnclosureId, editInputs, handleInputChange]);

	const firstTableInstance = useTable(
		{
			columns: table1Columns,
			data: table1Data,
			pageIndex: firstPageIndex,
			pageSize,
			initialState: { pageIndex: firstPageIndex, pageSize },
			autoResetPage: false,
			manualPagination: false,
		},
		useGlobalFilter,
		usePagination
	);

	const {
		getTableProps: getTableProps1,
		getTableBodyProps: getTableBodyProps1,
		headerGroups: headerGroups1,
		page: page1,
		prepareRow: prepareRow1,
		state: stateFirst,
		setGlobalFilter: setGlobalFilter1,
		canNextPage: canNextPage1,
		canPreviousPage: canPreviousPage1,
		nextPage: nextPage1,
		previousPage: previousPage1,
		gotoPage: gotoPage1,
		pageOptions: pageOptions1,
		setPageSize: setPageSize1,
 
	} = firstTableInstance;

/*useEffect(() => { setFirstPageIndex(stateFirst.pageIndex); setFirstGlobalFilter(stateFirst.globalFilter); }, [stateFirst.pageIndex, stateFirst.globalFilter]);*/
  useEffect(() => {
    setPageSize1(pageSize); // update table when dropdown changes
  }, [pageSize, setPageSize1]);
	// Second Table
	const secondTableInstance = useTable(
		{
			columns: table2Columns,
			data: checklistItems,
			pageSize,
			initialState: { pageIndex: secondPageIndex, pageSize, globalFilter: secondGlobalFilter },
			autoResetPage: false,
		},
		useGlobalFilter,
		usePagination,
	);

	const {
		getTableProps: getTableProps2,
		getTableBodyProps: getTableBodyProps2,
		headerGroups: headerGroups2,
		page: page2,
		prepareRow: prepareRow2,
		state: stateSecond,
		setGlobalFilter: setGlobalFilter2,
		canNextPage: canNextPage2,
		canPreviousPage: canPreviousPage2,
		nextPage: nextPage2,
		previousPage: previousPage2,
		gotoPage: gotoPage2,
		pageOptions: pageOptions2,
		setPageSize: setPageSize2,
 
		
	} = secondTableInstance;

  /*useEffect(() => { setSecondPageIndex(stateSecond.pageIndex); setSecondGlobalFilter(stateSecond.globalFilter); }, [stateSecond.pageIndex, stateSecond.globalFilter]);*/
  useEffect(() => {
    setPageSize2(pageSize); // update table when dropdown changes
	gotoPage2(0);
  }, [pageSize, setPageSize2, gotoPage2, checklistItems]);

	// Select columns and data depending on dropdown choice

	const activeColumns = useMemo(
		() => (selectedOption === "second" ? table2Columns : table1Columns),
		[selectedOption, table1Columns, table2Columns]
	);
	const activeData = useMemo(
		() => (selectedOption === "second" ? checklistItems : table1Data),
		[selectedOption, checklistItems, table1Data]
	);

	// React Table hook - IMPORTANT: Declare useTable before handlers that use its return

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
			columns: activeColumns,
			data: activeData,
			initialState: { pageIndex: 0, pageSize },
			autoResetPage: false // keeps pagination stable on data changes
		},
		useGlobalFilter,
		usePagination
	);

	// Handler: Add Row (added after useTable hook so it has access to gotoPage, pageOptions)

	const [rowJustAdded, setRowJustAdded] = useState(false);

	const handleAddRow = () => {
		const newId = Date.now();
		const newRow = {
			id: newId,
			encloserName: "",
			action_type: "edit",
			isNew: true,
		};
		setOpenEnclosers(prev => [...prev, newRow]);
		setEditingEnclosureId(newId);
		setEditInputs(inputs => ({ ...inputs, [newId]: "" }));
		setRowJustAdded(true); // mark that we just added a row
	};

	useEffect(() => {
		if (rowJustAdded) {
			const timer = setTimeout(() => {
				if (pageOptions1.length > 0) {
					gotoPage1(pageOptions1.length - 1); // ✅ use firstTableInstance here
				}
				setRowJustAdded(false);
			}, 0);

			return () => clearTimeout(timer);
		}
	}, [rowJustAdded, pageOptions1, gotoPage1]);

	const handleSubmitRow = async (id) => {
		const inputVal = editInputs[id]?.trim();
		const updatedAction = editInputs[`${id}_action`] ?? "OPEN"; // default OPEN

		if (!inputVal) {
			alert("Please enter a valid enclosure name");
			return;
		}

		// 🔍 Check duplicate before saving (ignore current editing row)
		const duplicate = openEnclosers.some(
			(item) =>
				item.id !== id &&
				item.encloserName?.trim().toLowerCase() === inputVal.toLowerCase()
		);

		if (duplicate) {
			alert("This enclosure name already exists!");
			return;
		}

		const rowData = openEnclosers.find(item => item.id === id);
		const payload = {
			encloserName: inputVal,
			action: updatedAction,
		};

		try {
			if (rowData?.isNew) {
				// 🔥 POST new row
				const res = await axios.post(`${API_BASE_URL}api/v1/enclouser/submit`, payload);

				const savedRow = res.data;

				setOpenEnclosers(prev =>
					prev.map(item =>
						item.id === id
							? {
								...item,
								id: savedRow.id,
								encloserName: savedRow.encloserName,
								action: savedRow.action,

								isNew: false
							}
							: item
					)
				);
			} else {
				// 🔥 PUT update existing row
				await axios.put(`${API_BASE_URL}api/v1/enclouser/updateEnclosureName/${id}`, payload);

				setOpenEnclosers(prev =>
					prev.map(item =>
						item.id === id
							? {
								...item, encloserName: inputVal, action: updatedAction,
							}
							: item
					)
				);
			}

			setEditingEnclosureId(null);
			setEditInputs(inputs => {
				const copy = { ...inputs };
				delete copy[id];
				return copy;
			});

			console.log(rowData?.isNew ? "Row submitted successfully" : "Row updated successfully");
		} catch (error) {
			console.error("Error saving row:", error);
			alert("Failed to save row. Please try again.");
		}
	};

	// Handler: Cancel row editing

	const cancelEditingNewRow = (id) => {
		setEditingEnclosureId(null);
		setEditInputs(inputs => {
			const copy = { ...inputs };
			delete copy[id];
			return copy;
		});
		const isNewRow = openEnclosers.find(item => item.id === id)?.isNew;
		if (isNewRow) {
			setOpenEnclosers(prev => prev.filter(item => item.id !== id));
		}
	};

	// Handler: Delete row

	const handleDeleteRow = async (id) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this row?");
		if (!confirmDelete) return;

		try {
			await axios.delete(`${API_BASE_URL}api/v1/enclouser/deleteEncloserName/${id}`);
			console.log("Deleting row with ID:", id);
			setOpenEnclosers(prev => prev.filter(item => item.id !== id));
			console.log("Row deleted successfully");
		} catch (error) {
			console.error("Error deleting row:", error);
			alert("Failed to delete row");
		}
	};

	const [addRfiEnclosuresOptions, setAddRfiEnclosuresOptions] = useState([]);

	// ------------------- ADD ROW -------------------
	const handleThirdAddRow = () => {
		setThirdTableData((prev) => {
			const newRow = {
				sr_no: prev.length + 1,
				activity: "",
				rfiDescription: "",
				enclosures: [],
				isNew: true,
				isEditing: true,
			};
			const newData = [...prev, newRow];

			// Jump to last page where new row will appear
			const lastPageIndex = Math.floor(newData.length / pageSize);
			setThirdPageIndex(lastPageIndex);
			setThirdCurrentPage(lastPageIndex + 1);
			setThirdSearchInput(""); // reset search

			return newData;
		});
	};

	// ------------------- FETCH ENCLOSURE OPTIONS -------------------
	useEffect(() => {
		axios
			.get(`${API_BASE_URL}api/v1/enclouser/names`, { params: { action: "OPEN" } })
			.then((res) => {
				const options = (res.data || []).map((e) => ({
					value: e.encloserName || e, // backend may return object or string
					label: e.encloserName || e,
				}));
				setAddRfiEnclosuresOptions(options);
			})
			.catch((err) => console.error("Error fetching enclosure names:", err));
	}, [API_BASE_URL]);

	// ------------------- FETCH TABLE DATA -------------------
	useEffect(() => {
		if (selectedOption === "third") {
			fetch(`${API_BASE_URL}rfi/Referenece-Form`)
				.then((res) => res.json())
				.then((data) => {
					const withSrNo = data.map((item, index) => ({
						id: item.id, // keep DB id
						sr_no: index + 1, // frontend only
						activity: item.activity || "",
						rfiDescription: item.rfiDescription || "",
						enclosures: item.enclosures
							? Array.isArray(item.enclosures)
								? item.enclosures
								: item.enclosures.split(",").map(e => e.trim())
							: [],
						isNew: false,
						isEditing: false,
					}));
					setThirdTableData(withSrNo);
					setThirdCurrentPage(1);
					setThirdPageIndex(0);
					setThirdEditInputs({});
				})
				.catch((err) => console.error("Error fetching third form data:", err));
		}
	}, [selectedOption, API_BASE_URL]);

	// ------------------- PAGINATION + FILTER -------------------
	const paginateAndFilter = (data, filter, page, size) => {
		const lowerFilter = filter.toLowerCase();
		const filtered = data.filter(row =>
			row.isNew || row.isEditing ||
			(row.activity && row.activity.toLowerCase().includes(lowerFilter)) ||
			(row.rfiDescription && row.rfiDescription.toLowerCase().includes(lowerFilter)) ||
			(row.enclosures && Array.isArray(row.enclosures) &&
				row.enclosures.some(val => val && val.toLowerCase().includes(lowerFilter))) ||
			(row.description && row.description.toLowerCase().includes(lowerFilter)) // for checklist
		);
		const start = page * size;
		return {
			paginated: filtered.slice(start, start + size),
			totalPages: Math.ceil(filtered.length / size) || 1,
			totalRows: filtered.length
		};
	};

	// First Table
	const { paginated: firstPaginated, totalPages: firstTotalPages, totalRows: firstTotalRows } = useMemo(
		() => paginateAndFilter(table1Data, firstSearchInput, firstPageIndex, pageSize),
		[table1Data, firstSearchInput, firstPageIndex, pageSize]
	);

	// Second Table
	const { paginated: secondPaginated, totalPages: secondTotalPages, totalRows: secondTotalRows } = useMemo(
		() => paginateAndFilter(checklistItems, secondSearchInput, secondPageIndex, pageSize),
		[checklistItems, secondSearchInput, secondPageIndex, pageSize]
	);

	// Third Table
	const { paginated: thirdPaginated, totalPages: thirdTotalPages, totalRows: thirdTotalRows } = useMemo(
		() => paginateAndFilter(thirdTableData, thirdSearchInput, thirdPageIndex, pageSize),
		[thirdTableData, thirdSearchInput, thirdPageIndex, pageSize]
	);


	// ------------------- HANDLERS -------------------
	const handleThirdInputChange = (sr_no, field, value) => {
		setThirdTableData((prev) =>
			prev.map((row) => (row.sr_no === sr_no ? { ...row, [field]: value } : row))
		);
		setThirdEditInputs((prev) => ({
			...prev,
			[sr_no]: { ...prev[sr_no], [field]: value },
		}));
	};

	const handleThirdAction = (sr_no) => {
		setThirdTableData((prev) =>
			prev.map((row) =>
				row.sr_no === sr_no ? { ...row, isEditing: true } : row
			)
		);
	};

	const handleThirdSubmit = async (rowData) => {
		try {
			const response = await fetch(`${API_BASE_URL}rfi/send-data`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					activity: rowData.activity,
					rfiDescription: rowData.rfiDescription,
					enclosures: Array.isArray(rowData.enclosures)
						? rowData.enclosures.join(",")
						: rowData.enclosures,
				}),
			});

			if (response.ok) {
				const saved = await response.json();
				setThirdTableData((prev) =>
					prev.map((r) =>
						r.sr_no === rowData.sr_no
							? { ...r, id: saved.id, isNew: false, isEditing: false }
							: r
					)
				);
				alert("Row submitted successfully!");
			} else {
				const errorText = await response.text();
				console.error("Error response:", errorText);
				alert("Error submitting row");
			}
		} catch (error) {
			console.error("Submit error:", error);
		}
	};

	const handleThirdEdit = async (rowData) => {
		if (!rowData.id) {
			alert("Row does not exist in DB yet. Please submit first.");
			return;
		}

		try {
			const payload = {
				activity: rowData.activity || "",
				rfiDescription: rowData.rfiDescription || "",
				enclosures: rowData.enclosures && Array.isArray(rowData.enclosures)
					? rowData.enclosures.join(",")
					: rowData.enclosures || "",
			};

			const response = await fetch(`${API_BASE_URL}rfi/Update/${rowData.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				const updated = await response.json();

				setThirdTableData((prev) =>
					prev.map((r) =>
						r.sr_no === rowData.sr_no
							? {
								...r,
								...updated,
								sr_no: rowData.sr_no,
								isEditing: false,
								enclosures: updated.enclosures
									? updated.enclosures.split(",").map((e) => e.trim())
									: [],
							}
							: r
					)
				);
				alert("Row updated successfully!");
			} else {
				const text = await response.text();
				console.error("Update failed:", text);
				alert("Error updating row: " + text);
			}
		} catch (error) {
			console.error("Update error:", error);
			alert("Error updating row: " + error.message);
		}
	};

	const handleThirdCancelEdit = (sr_no) => {
		setThirdTableData((prev) =>
			prev.map((row) => {
				if (row.sr_no === sr_no) {
					return row.isNew
						? null // remove new row
						: { ...row, isEditing: false }; // revert edit
				}
				return row;
			}).filter(Boolean)
		);
	};
	// ------------------- TABLE COLUMNS -------------------
	const thirdTableColumns = [
		{
			Header: "Sr No",
			accessor: "sr_no",
		},
		{
			Header: "Activity",
			accessor: "activity",
			Cell: ({ row }) => {
				const { sr_no, activity, isEditing, isNew } = row.original;
				return isEditing || isNew ? (
					<input
						value={thirdEditInputs[sr_no]?.activity ?? activity ?? ""}
						onChange={(e) =>
							handleThirdInputChange(sr_no, "activity", e.target.value)
						}
					/>
				) : (
					activity
				);
			},
		},
		{
			Header: "RFI Description",
			accessor: "rfiDescription",
			Cell: ({ row }) => {
				const { sr_no, rfiDescription, isEditing, isNew } = row.original;
				return isEditing || isNew ? (
					<input
						value={thirdEditInputs[sr_no]?.rfiDescription ?? rfiDescription ?? ""}
						onChange={(e) =>
							handleThirdInputChange(sr_no, "rfiDescription", e.target.value)
						}
					/>
				) : (
					rfiDescription
				);
			},
		},
		{
			Header: "Enclosure/Attachments",
			accessor: "enclosures",
			Cell: ({ row }) => {
				const { sr_no, enclosures, isEditing, isNew } = row.original;
				return isEditing || isNew ? (
					<Select
						isMulti
						options={addRfiEnclosuresOptions}
						value={addRfiEnclosuresOptions.filter((opt) =>
							(enclosures || []).includes(opt.value)
						)}
						onChange={(selectedOptions) =>
							handleThirdInputChange(
								sr_no,
								"enclosures",
								selectedOptions
									? selectedOptions.map((opt) => opt.value)
									: []
							)
						}
						placeholder="Select Enclosures"
					/>
				) : enclosures && enclosures.length > 0 ? (
					enclosures
						.map(
							(val) =>
								addRfiEnclosuresOptions.find((opt) => opt.value === val)?.label ||
								val
						)
						.join(", ")
				) : (
					""
				);
			},
		},
		{
			Header: "Action",
			accessor: "action",
			Cell: ({ row }) => {
				const { sr_no, isEditing, isNew } = row.original;
				const handleClick = () => {
					if (isNew) {
						handleThirdSubmit(row.original);
					} else if (isEditing) {
						handleThirdEdit(row.original);
					} else {
						handleThirdAction(sr_no);
					}
				};
				return (
					<>
						<button onClick={handleClick}>
							{isNew ? "Submit" : isEditing ? "Save" : "Edit"}
						</button>
						{(isEditing || isNew) && (
							<button
								style={{ marginLeft: "6px" }}
								onClick={() => handleThirdCancelEdit(sr_no)}
							>
								Cancel
							</button>
						)}
					</>
				);
			},
		},
	];

	const PaginationControls = ({ pageIndex, canPreviousPage, canNextPage, previousPage, nextPage, gotoPage, pageOptions }) => (
		<div className="irf-pagination">
			<button disabled={!canPreviousPage} onClick={previousPage}>Prev</button>
			{pageOptions.map(i => (
				<button key={i} className={i === pageIndex ? "irf-activePage" : ""} onClick={() => gotoPage(i)}>{i + 1}</button>
			))}
			<button disabled={!canNextPage} onClick={nextPage}>Next</button>
		</div>
	);

	return (
		<div className="dashboard create-rfi inspection">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="irf-rfi-table-container">
						<h2 className="irf-section-heading">Reference Form</h2>

						{/* Dropdowns */}
						<div className="irf-form-row">
							<div className="irf-form-fields">
								<label>Select Form: </label>
								<select
									value={selectedOption}
									onChange={(e) => {
										setSelectedOption(e.target.value);
										setSubOption("");
										setSubOptionId("");
										setChecklistItems([]);
										setEditingId(null);
										setEditDescription("");
									}}
								>
									<option value="">-- Select --</option>
									<option value="first">RFI Enclosure List</option>
									<option value="second">Checklist Description</option>
									<option value="third">Reference Form</option>
								</select>

							</div>
							{/*						{selectedOption === "first" && <ReferenceForm />}
*/}
							<div className="irf-form-fields">
								{selectedOption === "second" && (
									<>
										<label>Sub Option: </label>
										<select value={subOptionId} onChange={handleSubOptionChange}>
											<option value="">-- Select Enclosure --</option>
											{Array.isArray(enclosureList) &&
												enclosureList.map((enc) => (
													<option key={enc.id} value={enc.id}>
														{enc.encloserName}
													</option>
												))}
										</select>




									</>
								)}
							</div>
						</div>

						{/* Add New Description Form (only for Checklist Description) */}
						{selectedOption === "second" && subOptionId && (
							<div className="irf-add-description-form">
								<h3>Add New Description</h3>
								<div className="irf-form-row">
									<input
										type="text"
										value={newDescription}
										onChange={(e) => setNewDescription(e.target.value)}
										placeholder="Enter new description"
										className="irf-description-input"
									/>
									<button
										onClick={handleAddDescription}
										className="btn btn-primary"
									>
										Add Row
									</button>
								</div>
							</div>
						)}

						{/* Edit Description Form (only when editing) */}
						{editingId && (
							<div className="irf-edit-description-form">
								<h3>Edit Description</h3>
								<div className="irf-form-row">
									<input
										type="text"
										value={editDescription}
										onChange={(e) => setEditDescription(e.target.value)}
										placeholder="Edit description"
										className="irf-description-input"
									/>
									<button
										onClick={() => handleUpdateDescription(editingId)}
										className="irf-btn-update"
									>
										Update
									</button>
									<button
										onClick={cancelEditing}
										className="irf-btn-cancel"
									>
										Cancel
									</button>
								</div>
							</div>
						)}

						{/* Display selected sub-option */}
						{selectedOption === "second" && subOption && (
							<div className="irf-selected-suboption">
								<h3>Checklist for: {subOption}</h3>
							</div>
						)}

						{/* Table Controls */}
						<div className="irf-table-top-bar">
							<div className="left-controls">
								<label>
									Show{" "}
									<select
										value={pageSize}
										onChange={(e) => {
											setPageSize(Number(e.target.value));
											tableSetPageSize(Number(e.target.value));
										}}
									>
										{[5, 10, 20].map((size) => (
											<option key={size} value={size}>
												{size}
											</option>
										))}
									</select>{" "}
									entries
								</label>
							</div>
							<div className="right-controls">
								<input
									className="irf-input search"
									value={thirdSearchInput}
									onChange={e => {
										setThirdSearchInput(e.target.value);
										setThirdPageIndex(0);        // reset to first page on search term change
										setThirdCurrentPage(1);
									}}
									placeholder="Search"
								/>
							</div>
						</div>

						<div style={{ display: "flex", justifyContent: "flex-end", margin: "6px 0" }}>
							{(selectedOption === "first") && (
								<button
									className="btn btn-primary"
									onClick={() => {
										handleAddRow();
										setTimeout(() => {
											gotoPage(pageOptions.length > 0 ? pageOptions.length - 1 : 0);
										}, 0);
									}}
								>
									Add Row
								</button>
							)}
							{selectedOption === "third" && (
								<button className="btn btn-primary" onClick={handleThirdAddRow}>Add Row</button>
							)}

						</div>



						{/* Table */}
						{(selectedOption === "first" || selectedOption === "second") && (

							<div className="table-section">
								<div className="table-wrapper">
									<table {...getTableProps()} className="irf-responsive-table">
										<thead>
											{headerGroups.map((group) => (
												<tr {...group.getHeaderGroupProps()}>
													{group.headers.map((col) => (
														<th {...col.getHeaderProps()}>{col.render("Header")}</th>
													))}
												</tr>
											))}
										</thead>
										<tbody {...(selectedOption === "first" ? getTableBodyProps1() : getTableBodyProps2())}>
											{(selectedOption === "first" ? page1 : page2).length > 0 ? (
												(selectedOption === "first" ? page1 : page2).map(row => {
													(selectedOption === "first" ? prepareRow1 : prepareRow2)(row);
													return (
														<tr
															{...row.getRowProps()}
															key={row.original.id}
														>
															{row.cells.map(cell => {
																const columnId = cell.column.id;
																const rowId = row.original ? row.original.id : undefined;
																return (
																	<td {...cell.getCellProps()}>
																		{columnId === "encloserName" && row.original && editingEnclosureId === rowId ? (
																			<input
																				value={editInputs[rowId] ?? ""}
																				onChange={e => setEditInputs(prev => ({ ...prev, [rowId]: e.target.value }))}
																				placeholder="Enter enclosure name"
																			/>
																		) : (
																			cell.render("Cell")
																		)}
																	</td>
																);
															})}
														</tr>
													);
												})
											) : (
												<tr>
													<td colSpan={activeColumns.length} className="irf-no-data">
														{selectedOption === "second" && subOptionId
															? "No checklist items available"
															: "No data available"}
													</td>
												</tr>
											)}
										</tbody>

									</table>
								</div>


							</div>
						)}

						{/* Third Table */}
						{selectedOption === "third" && (
							<>

								<table className="responsive-table">
									<thead>
										<tr>
											{thirdTableColumns.map((col) => (
												<th key={col.accessor}>{col.Header}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{thirdPaginated.length === 0 ? (
											<tr>
												<td colSpan={4}>No data available</td>
											</tr>
										) : (
											thirdPaginated.map((row) => (
												<tr key={row.sr_no}>
													{thirdTableColumns.map((col) => (
														<td key={col.accessor}>
															{col.Cell
																? col.Cell({ row: { original: row } }) // <-- wrap your data row as { original : ... }
																: row[col.accessor]}
														</td>
													))}

												</tr>
											))
										)}
									</tbody>
								</table>

							</>
						)}

						{/* Pagination */}
						<div className="d-flex align-items-center justify-content-between mt-2">
							<span className="irf-showing-entries">
								{selectedOption === "third" ? (
									<>
										Showing {thirdPageIndex * pageSize + 1} to {Math.min((thirdPageIndex + 1) * pageSize, thirdTableData.length)} of {thirdTableData.length} entries
									</>
								) : selectedOption === "first" ? (
									<>
										Showing {stateFirst.pageIndex * pageSize + 1} to {Math.min((stateFirst.pageIndex + 1) * pageSize, table1Data.length)} of {table1Data.length} entries
									</>
								) : selectedOption === "second" ? (
									<>
										Showing {stateSecond.pageIndex * pageSize + 1} to {Math.min((stateSecond.pageIndex + 1) * pageSize, checklistItems.length)} of {checklistItems.length} entries
									</>
								) : null}
							</span>


							{(selectedOption === "first" || selectedOption === "second") && (
								<>
									{/* Pagination Controls */}
									<div className="irf-pagination">
										<button
											disabled={selectedOption === "first" ? !canPreviousPage1 : !canPreviousPage2}
											onClick={selectedOption === "first" ? previousPage1 : previousPage2}
										>
											Prev
										</button>
										{[...(selectedOption === "first" ? pageOptions1 : pageOptions2).keys()].map(i => (
											<button
												key={i}
												className={
													i === (selectedOption === "first" ? stateFirst.pageIndex : stateSecond.pageIndex)
														? "irf-activePage"
														: ""
												}
												onClick={() => (selectedOption === "first" ? gotoPage1(i) : gotoPage2(i))}
											>
												{i + 1}
											</button>
										))}
										<button
											disabled={selectedOption === "first" ? !canNextPage1 : !canNextPage2}
											onClick={selectedOption === "first" ? nextPage1 : nextPage2}
										>
											Next
										</button>
									</div>
								</>

							)}
							{selectedOption === "third" && (
								<>
									<div className="irf-pagination">
										<button disabled={thirdPageIndex === 0} onClick={() => setThirdPageIndex(i => Math.max(i - 1, 0))}>Prev</button>
										{[...Array(thirdTotalPages).keys()].map(i => (
											<button
												key={i}
												className={i === thirdPageIndex ? 'irf-activePage' : ''}
												onClick={() => setThirdPageIndex(i)}
											>{i + 1}</button>
										))}
										<button disabled={thirdPageIndex === thirdTotalPages - 1} onClick={() => setThirdPageIndex(i => Math.min(i + 1, thirdTotalPages - 1))}>Next</button>
									</div>
								</>
							)}

						</div>


					</div>
				</div>
			</div>
		</div>
	);
};

export default InspectionReferenceForm;