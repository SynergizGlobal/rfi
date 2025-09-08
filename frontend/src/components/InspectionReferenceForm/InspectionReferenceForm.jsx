
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
	const [thirdTableData, setThirdTableData] = useState([]);
	const [thirdCurrentPage, setThirdCurrentPage] = useState(1);
	const [thirdGlobalFilter, setThirdGlobalFilter] = useState("");
	const [thirdEditInputs, setThirdEditInputs] = useState({});
	const [thirdEditingSrNo, setThirdEditingSrNo] = useState(null);
	  const [tableData, setTableData] = useState([]);
	  const [currentPage, setCurrentPage] = useState(1);

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

	const newRowRef = useRef(null);

	useEffect(() => {	
		if (selectedOption === "first") {
			axios
				.get(`${API_BASE_URL}api/v1/enclouser/names`, {
					params: { action: "OPEN" }
				})
				.then((res) => {
					setOpenEnclosers(res.data);
				})
				.catch((err) => console.error("Error fetching enclosure names:", err));
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

	  const handleThirdAddRow = () => {
    const newRow = {
      sr_no: thirdTableData.length + 1,
      fieldOne: "",
      fieldTwo: "",
      enclosures: [],
      isNew: true,
      isEditing: true,
    };
    setThirdTableData((prev) => [...prev, newRow]);
    setThirdEditInputs((prev) => ({ ...prev, [newRow.sr_no]: newRow }));
    setThirdEditingSrNo(newRow.sr_no);
    setCurrentPage(Math.ceil((tableData.length + 1) / pageSize));
    setThirdGlobalFilter("");
  };

	useEffect(() => {
  axios
    .get(`${API_BASE_URL}api/v1/enclouser/names`, { params: { action: "OPEN" } })
    .then((res) => setOpenEnclosers(res.data))
    .catch((err) => console.error("Error fetching enclosure names:", err));
}, [API_BASE_URL]);

	useEffect(() => {
    if (selectedOption === "third") {
      fetch(`${API_BASE_URL}rfi/Referenece-Form`)
        .then((res) => res.json())
        .then((data) => {
          const withSrNo = data.map((item, index) => ({
            sr_no: index + 1,
            fieldOne: item.activity || "",           // Replace with actual property names
            fieldTwo: item.rfiDescription || "",     // Replace with actual property names
            enclosures: item.enclosures
            ? Array.isArray(item.enclosures)
              ? item.enclosures // already array
              : item.enclosures.split(',').map(e => e.trim()) // CSV to array
            : [],
            isNew: false,
            isEditing: false,
          }));
          setThirdTableData(withSrNo);
          setThirdCurrentPage(1);
          setThirdGlobalFilter("");
          setThirdEditInputs({});
          setThirdEditingSrNo(null);
        })
        .catch((err) => console.error("Error fetching third form data:", err));
    }
  }, [selectedOption, API_BASE_URL]);

   // Pagination and Filter utility
  const paginateAndFilter = (data, filter, page, size) => {
    const lowerFilter = filter.toLowerCase();
    const filtered = data.filter(row =>
      (row.fieldOne && row.fieldOne.toLowerCase().includes(lowerFilter)) ||
      (row.fieldTwo && row.fieldTwo.toLowerCase().includes(lowerFilter)) ||
      (row.enclosure_attachments && row.enclosure_attachments.toLowerCase().includes(lowerFilter))
    );
    const start = (page - 1) * size;
    return {
      paginated: filtered.slice(start, start + size),
      total: Math.ceil(filtered.length / size) || 1,
    };
  };



  // Third Form filtered + paginated data
  const {
    paginated: thirdPaginatedData,
    total: thirdTotalPages,
  } = useMemo(
    () =>
      paginateAndFilter(thirdTableData, thirdGlobalFilter, thirdCurrentPage, pageSize),
    [thirdTableData, thirdGlobalFilter, thirdCurrentPage, pageSize]
  );




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
				fetchChecklistItems();
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


	// third table scripts

	const addRfiEnclosuresOptions = useMemo(
    () =>
      openEnclosers.map((encl) => ({
        value: encl.encloserName,
        label: encl.encloserName,
      })),
    [openEnclosers]
  );



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
			Header: "Action",
			accessor: "action",
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

	const handleAddRow = () => {
		const newId = Date.now();
		const newRow = {
			id: newId,
			encloserName: "",
			action: "edit", // or "submit", "delete"
			isNew: true,
		};
		setOpenEnclosers(prev => [...prev, newRow]);
		setEditingEnclosureId(newId);
		setEditInputs(inputs => ({ ...inputs, [newId]: "" }));

		// Flip to last page after row added
		setTimeout(() => {
			if (pageOptions.length > 0) {
				gotoPage(pageOptions.length - 1);
			}
		}, 0);
	};

	const handleSubmitRow = async (id) => {
		const inputVal = editInputs[id]?.trim();
		if (!inputVal) {
			alert("Please enter a valid enclosure name");
			return;
		}

		const rowData = openEnclosers.find(item => item.id === id);
		const payload = { encloserName: inputVal };

		try {
			if (rowData?.isNew) {
				// New row → POST
				await axios.post(`${API_BASE_URL}api/v1/enclouser/submit`, payload);
			} else {
				// Existing row → PUT
				await axios.put(`${API_BASE_URL}api/v1/enclouser/updateEnclosureName/${id}`, payload);
			}

			// Update local state
			setOpenEnclosers(prev =>
				prev.map(item =>
					item.id === id
						? { ...item, encloserName: inputVal, isNew: false }
						: item
				)
			);

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

	// Focus on input when editingEnclosureId changes

	useEffect(() => {
		if (editingEnclosureId && newRowRef.current) {
			newRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
			const input = newRowRef.current.querySelector("input");
			if (input) input.focus();
		}
	}, [editingEnclosureId, page]);

	 // Handlers for Third Form inputs/actions
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
      prev.map((row) => (row.sr_no === sr_no ? { ...row, isEditing: true } : row))
    );
  };

  const handleThirdSubmit = async (rowData) => {
    try {
      const response = await fetch(`${API_BASE_URL}rfi/Third-Form-Add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowData),
      });
      if (response.ok) {
        const saved = await response.json();
        setThirdTableData((prev) =>
          prev.map((r) =>
            r.sr_no === rowData.sr_no ? { ...r, id: saved.id, isNew: false, isEditing: false } : r
          )
        );
        alert("Third form row submitted successfully!");
      } else {
        alert("Error submitting third form row");
      }
    } catch (error) {
      console.error("Third form submit error:", error);
    }
  };

  const handleThirdEdit = async (rowData) => {
    if (!rowData.id) {
      alert("Row does not exist in DB yet.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}rfi/Third-Form-Update/${rowData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowData),
      });
      if (response.ok) {
        setThirdTableData((prev) =>
          prev.map((r) => (r.sr_no === rowData.sr_no ? { ...r, isEditing: false } : r))
        );
        alert("Third form row updated successfully!");
      } else {
        alert("Error updating third form row");
      }
    } catch (error) {
      console.error("Third form update error:", error);
    }
  };

  const handleThirdCancelEdit = (sr_no) => {
    setThirdTableData((prev) =>
      prev.map((row) =>
        row.sr_no === sr_no ? { ...row, isEditing: false, isNew: false } : row
      )
    );
    setThirdEditInputs((prev) => {
      const copy = { ...prev };
      delete copy[sr_no];
      return copy;
    });
  };

  // Third Form columns
  const thirdTableColumns = [
    { Header: "Sr No", accessor: "sr_no" },
    {
      Header: "Activity",
      accessor: "fieldOne",
      Cell: ({ row }) => {
        const { sr_no, fieldOne, isEditing, isNew } = row.original;
        return isEditing || isNew ? (
          <input
            value={thirdEditInputs[sr_no]?.fieldOne ?? fieldOne ?? ""}
            onChange={(e) =>
              handleThirdInputChange(sr_no, "fieldOne", e.target.value)
            }
          />
        ) : (
          fieldOne
        );
      },
    },
    {
      Header: "RFI Description",
      accessor: "fieldTwo",
      Cell: ({ row }) => {
        const { sr_no, fieldTwo, isEditing, isNew } = row.original;
        return isEditing || isNew ? (
          <input
            value={thirdEditInputs[sr_no]?.fieldTwo ?? fieldTwo ?? ""}
            onChange={(e) =>
              handleThirdInputChange(sr_no, "fieldTwo", e.target.value)
            }
          />
        ) : (
          fieldTwo
        );
      },
    },
    {
      Header: "Enclosure/Attachments",
      accessor: "enclosures",
      Cell: ({ row }) => {
        const { sr_no, enclosures, isEditing, isNew } = row.original;
        if (isEditing || isNew) {
          return (
            <Select
              isMulti
              options={addRfiEnclosuresOptions}
              value={addRfiEnclosuresOptions.filter(opt => (enclosures || []).includes(opt.value))}
              onChange={selectedOptions =>
                handleThirdInputChange(
                  sr_no,
                  "enclosures",
                  selectedOptions ? selectedOptions.map(opt => opt.value) : []
                )
              }
              placeholder="Select Enclosures"
            />
          );
        } else {
          return enclosures && enclosures.length > 0
            ? enclosures.map(val =>
                addRfiEnclosuresOptions.find(opt => opt.value === val)?.label || val
              ).join(", ")
            : "";
        }
      }
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => {
        const { sr_no, isEditing, isNew } = row.original;
        if (isEditing || isNew) {
          return (
            <>
              <button onClick={() => handleThirdSubmit(row.original)}>Save</button>
              <button onClick={() => handleThirdCancelEdit(sr_no)}>Cancel</button>
            </>
          );
        }
        return <button onClick={() => handleThirdAction(sr_no)}>Edit</button>;
      },
    },
  ];

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
										className="irf-btn-add"
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
                  className="irf-search-input"
                  value={
                    selectedOption === "third"
                      ? thirdGlobalFilter
                      : globalFilter || ""
                  }
                  onChange={e =>
                    selectedOption === "third"
                      ? setThirdGlobalFilter(e.target.value)
                      : setGlobalFilter(e.target.value)
                  }
                  placeholder="Search..."
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", margin: "6px 0" }}>
              {(selectedOption === "first" || selectedOption === "second") && (
                <button
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
                <button
                  onClick={() => {
                    const newRow = {
                      sr_no: thirdTableData.length + 1,
                      fieldOne: "",
                      fieldTwo: "",
                      enclosures: [],
                      isNew: true,
                      isEditing: true,
                    };
                    setThirdTableData((prev) => [...prev, newRow]);
                    setThirdEditInputs((prev) => ({ ...prev, [newRow.sr_no]: newRow }));
                    setThirdEditingSrNo(newRow.sr_no);
                    setTimeout(() => {
                      setThirdCurrentPage(Math.ceil((thirdTableData.length + 1) / pageSize));
                    }, 0);
                  }}
                >
                  Add Row
                </button>
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
									<tbody {...getTableBodyProps()}>
										{page.length > 0 ? (
											page.map((row) => {
												prepareRow(row);
												return (
													<tr
														{...row.getRowProps()}
														key={row.original.id}  // Only here
													// DO NOT put ref here!
													>
														{row.cells.map((cell) => {
															const columnId = cell.column.id;
															const rowId = row.original ? row.original.id : undefined;

															return (
																<td {...cell.getCellProps()}>
																	{columnId === "encloserName" && row.original && editingEnclosureId === rowId ? (
																	<input
																		value={editInputs[rowId] ?? ""}
																		onChange={(e) =>
																		setEditInputs(prev => ({ ...prev, [rowId]: e.target.value }))
																		}
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
									{thirdPaginatedData.length === 0 ? (
										<tr>
										<td colSpan={4}>No data available</td>
										</tr>
									) : (
										thirdPaginatedData.map((row) => (
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
              {selectedOption === "third"
                ? `Showing ${
                    (thirdCurrentPage - 1) * pageSize + 1
                  } to ${
                    Math.min(thirdCurrentPage * pageSize, thirdTableData.length)
                  } of ${thirdTableData.length} entries`
                : `Showing ${pageIndex * pageSize + 1} to ${Math.min((pageIndex + 1) * pageSize, activeData.length)} of ${activeData.length} entries`
              }
            </span>

							<div className="irf-pagination">
								<button onClick={previousPage} disabled={!canPreviousPage}>
									‹
								</button>
								{pageOptions.map((_, i) => (
									<button
										key={i}
										onClick={() => gotoPage(i)}
										className={pageIndex === i ? "irf-activePage" : ""}
									>
										{i + 1}
									</button>
								))}
								<button onClick={nextPage} disabled={!canNextPage}>
									›
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InspectionReferenceForm;