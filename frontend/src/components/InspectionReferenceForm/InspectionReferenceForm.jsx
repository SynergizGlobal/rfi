/*import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import axios from "axios"; 
import HeaderRight from "../HeaderRight/HeaderRight";
import './InspectionReferenceForm.css';

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
  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

  // 🔹 Load encloser list for dropdown when "Checklist Description" selected
  useEffect(() => {
    if (selectedOption === "second") {
      axios.get(`${API_BASE_URL}api/v1/enclouser/by-action`)
        .then((res) => {
          // Store both id and encloserName for each item
          setEnclosureList(res.data);
        })
        .catch((err) => console.error("Error fetching enclosure list:", err));
    }
  }, [selectedOption, API_BASE_URL]);

  // 🔹 Load all open enclosers (for table 1)
  useEffect(() => {
    axios.get("http://localhost:8000/rfi/open")
      .then(res => setOpenEnclosers(res.data))
      .catch(err => console.error("Error fetching enclosers:", err));
  }, []);

  // 🔹 Fetch checklist descriptions when subOption changes
  useEffect(() => {
    if (selectedOption === "second" && subOptionId) {
      fetchChecklistItems();
    }
  }, [selectedOption, subOptionId, API_BASE_URL]);

  const fetchChecklistItems = () => {
    axios
      .get(`${API_BASE_URL}api/v1/enclouser/get/${subOptionId}`)
      .then((res) => {
        console.log("Checklist API response:", res.data); // Debug log
        
        // Map the response to create checklist items - use checklistDescription field
        const checklistItems = res.data.map((item, index) => ({
          id: item.id,
          sno: index + 1,
          description: item.checklistDescription || "No description available",
        }));
        
        setChecklistItems(checklistItems);
      })
      .catch((err) => {
        console.error("Error fetching checklist:", err);
        console.error("Error details:", err.response?.data); // More detailed error info
      });
  };

  // Handle add new description
  const handleAddDescription = () => {
    if (!newDescription.trim()) {
      alert("Please enter a description");
      return;
    }

    const dto = {
      checkListDescription: newDescription // Fixed field name to match backend
    };

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

  // Handle update description
  const handleUpdateDescription = (id) => {
    if (!editDescription.trim()) {
      alert("Please enter a description");
      return;
    }

    const dto = {
      checkListDescription: editDescription // Fixed field name to match backend
    };

    axios
      .put(`${API_BASE_URL}api/v1/enclouser/update/${id}`, dto)
      .then((res) => {
        setEditingId(null);
        setEditDescription("");
        fetchChecklistItems(); // Refresh the list
    
      })
      .catch((err) => {
        console.error("Error updating description:", err);
        console.error("Error response:", err.response?.data);
        alert("Error updating description");
      });
  };

  // Handle delete description - UPDATED TO UPDATE UI IMMEDIATELY
  const handleDeleteDescription = (id) => {
    if (window.confirm("Are you sure you want to delete this description?")) {
      // Update UI immediately for better user experience
      setChecklistItems(prevItems => prevItems.filter(item => item.id !== id));
      
      axios
        .delete(`${API_BASE_URL}api/v1/enclouser/delete/${id}`)
        .then((res) => {
          // Refresh the list to ensure consistency with backend
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

  // Start editing a description
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditDescription(item.description);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription("");
  };

  // Handle sub option selection
  const handleSubOptionChange = (e) => {
    const selectedId = e.target.value;
    setSubOptionId(selectedId);
    
    // Find the selected enclosure to get its name
    const selectedEnclosure = enclosureList.find(enc => enc.id === parseInt(selectedId));
    setSubOption(selectedEnclosure ? selectedEnclosure.encloserName : "");
  };

  // Table 1 (RFI Enclosure List) data
  const table1Data = useMemo(
    () =>
      openEnclosers.map((name, idx) => ({
        sr_no: idx + 1,
        enclosure_attachments: name,
      })),
    [openEnclosers]
  );

  const table1Columns = useMemo(
    () => [
      { Header: "Sr No", accessor: "sr_no" },
      { Header: "Enclosure/Attachments", accessor: "enclosure_attachments" },
    ],
    []
  );

  // Table 2 (Checklist Description) columns
  const table2Columns = useMemo(
    () => [
      { Header: "S. No", accessor: "sno" },
      { Header: "Reference Description", accessor: "description" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="action-buttons">
            <button 
              className="btn-edit"
              onClick={() => startEditing(row.original)}
            >
              Edit
            </button>
            <button 
              className="btn-delete"
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

  // Switch table depending on dropdown
  const activeColumns = useMemo(
    () => (selectedOption === "second" ? table2Columns : table1Columns),
    [selectedOption, table1Columns, table2Columns]
  );

  const activeData = useMemo(
    () => (selectedOption === "second" ? checklistItems : table1Data),
    [selectedOption, checklistItems, table1Data]
  );

  // React Table hooks
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
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="dashboard credted-rfi inspection">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">Reference Form</h2>

            { Dropdowns }
            <div className="form-row">
              <div className="form-fields">
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
                </select>
              </div>

              <div className="form-fields">
                {selectedOption === "second" && (
                  <>
                    <label>Sub Option: </label>
                    <select
                      value={subOptionId}
                      onChange={handleSubOptionChange}
                    >
                      <option value="">-- Select Enclosure --</option>
                      {enclosureList.map((enc) => (
                        <option key={enc.id} value={enc.id}>
                          {enc.encloserName}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            { Add New Description Form (only for Checklist Description) }
            {selectedOption === "second" && subOptionId && (
              <div className="add-description-form">
                <h3>Add New Description</h3>
                <div className="form-row">
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter new description"
                    className="description-input"
                  />
                  <button 
                    onClick={handleAddDescription}
                    className="btn-add"
                  >
                    Add Row
                  </button>
                </div>
              </div>
            )}

            { Edit Description Form (only when editing) }
            {editingId && (
              <div className="edit-description-form">
                <h3>Edit Description</h3>
                <div className="form-row">
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Edit description"
                    className="description-input"
                  />
                  <button 
                    onClick={() => handleUpdateDescription(editingId)}
                    className="btn-update"
                  >
                    Update
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            { Display selected sub-option }
            {selectedOption === "second" && subOption && (
              <div className="selected-suboption">
                <h3>Checklist for: {subOption}</h3>
              </div>
            )}

            { Table Controls }
            <div className="table-top-bar d-flex justify-content-between align-items-center">
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
                  className="search-input"
                  value={globalFilter || ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search..."
                />
              </div>
            </div>

            { Table }
            <div className="table-section">
              <div className="table-wrapper">
                <table {...getTableProps()} className="responsive-table">
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
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => (
                              <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={activeColumns.length} className="no-data">
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

            { Pagination }
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span>
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, activeData.length)} of{" "}
                {activeData.length} entries
              </span>
              <div className="pagination">
                <button onClick={previousPage} disabled={!canPreviousPage}>
                  ‹
                </button>
                {pageOptions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => gotoPage(i)}
                    className={pageIndex === i ? "activePage" : ""}
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

export default InspectionReferenceForm;*/

import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import axios from "axios"; 
import HeaderRight from "../HeaderRight/HeaderRight";
import './InspectionReferenceForm.css';

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
  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

  // 🔹 Load encloser list for dropdown when "Checklist Description" selected
  useEffect(() => {
    if (selectedOption === "second") {
      axios.get(`${API_BASE_URL}api/v1/enclouser/by-action`)
        .then((res) => {
          // Store both id and encloserName for each item
          setEnclosureList(res.data);
        })
        .catch((err) => console.error("Error fetching enclosure list:", err));
    }
  }, [selectedOption, API_BASE_URL]);

  // 🔹 Load all open enclosers (for table 1)
  useEffect(() => {
    axios.get("http://localhost:8000/rfi/open")
      .then(res => setOpenEnclosers(res.data))
      .catch(err => console.error("Error fetching enclosers:", err));
  }, []);

  // 🔹 Fetch checklist descriptions when subOption changes
  useEffect(() => {
    if (selectedOption === "second" && subOptionId) {
      fetchChecklistItems();
    }
  }, [selectedOption, subOptionId, API_BASE_URL]);

  const fetchChecklistItems = () => {
    axios
      .get(`${API_BASE_URL}api/v1/enclouser/get/${subOptionId}`)
      .then((res) => {
        console.log("Checklist API response:", res.data); // Debug log
        
        // Map the response to create checklist items - use checklistDescription field
        const checklistItems = res.data.map((item, index) => ({
          id: item.id,
          sno: index + 1,
          description: item.checklistDescription || "No description available",
        }));
        
        setChecklistItems(checklistItems);
      })
      .catch((err) => {
        console.error("Error fetching checklist:", err);
        console.error("Error details:", err.response?.data); // More detailed error info
      });
  };

  // Handle add new description
  const handleAddDescription = () => {
    if (!newDescription.trim()) {
      alert("Please enter a description");
      return;
    }

    const dto = {
      checkListDescription: newDescription // Fixed field name to match backend
    };

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

  // Handle update description
  const handleUpdateDescription = (id) => {
    if (!editDescription.trim()) {
      alert("Please enter a description");
      return;
    }

    const dto = {
      checkListDescription: editDescription // Fixed field name to match backend
    };

    axios
      .put(`${API_BASE_URL}api/v1/enclouser/update/${id}`, dto)
      .then((res) => {
        setEditingId(null);
        setEditDescription("");
        fetchChecklistItems(); // Refresh the list
    
      })
      .catch((err) => {
        console.error("Error updating description:", err);
        console.error("Error response:", err.response?.data);
        alert("Error updating description");
      });
  };

  // Handle delete description - UPDATED TO UPDATE UI IMMEDIATELY
  const handleDeleteDescription = (id) => {
    if (window.confirm("Are you sure you want to delete this description?")) {
      // Update UI immediately for better user experience
      setChecklistItems(prevItems => prevItems.filter(item => item.id !== id));
      
      axios
        .delete(`${API_BASE_URL}api/v1/enclouser/delete/${id}`)
        .then((res) => {
          // Refresh the list to ensure consistency with backend
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

  // Start editing a description
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditDescription(item.description);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditDescription("");
  };

  // Handle sub option selection
  const handleSubOptionChange = (e) => {
    const selectedId = e.target.value;
    setSubOptionId(selectedId);
    
    // Find the selected enclosure to get its name
    const selectedEnclosure = enclosureList.find(enc => enc.id === parseInt(selectedId));
    setSubOption(selectedEnclosure ? selectedEnclosure.encloserName : "");
  };

  // Table 1 (RFI Enclosure List) data
  const table1Data = useMemo(
    () =>
      openEnclosers.map((name, idx) => ({
        sr_no: idx + 1,
        enclosure_attachments: name,
      })),
    [openEnclosers]
  );

  const table1Columns = useMemo(
    () => [
      { Header: "Sr No", accessor: "sr_no" },
      { Header: "Enclosure/Attachments", accessor: "enclosure_attachments" },
    ],
    []
  );

  // Table 2 (Checklist Description) columns
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

  // Switch table depending on dropdown
  const activeColumns = useMemo(
    () => (selectedOption === "second" ? table2Columns : table1Columns),
    [selectedOption, table1Columns, table2Columns]
  );

  const activeData = useMemo(
    () => (selectedOption === "second" ? checklistItems : table1Data),
    [selectedOption, checklistItems, table1Data]
  );

  // React Table hooks
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
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="dashboard create-rfi inspection">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="irf-rfi-table-container">
            <h2 className="irf-section-heading">Reference Form</h2>

            {/* Dropdowns */}
            <div className="form-row">
              <div className="form-fields">
                <label>Select Form: </label>
                <select
                  value={selectedOption}
				  className="irf-description-input"
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
                </select>
              </div>

              <div className="form-fields">
                {selectedOption === "second" && (
                  <>
                    <label>Sub Option: </label>
                    <select
                      value={subOptionId}
                      onChange={handleSubOptionChange}
					  className="irf-description-input"
                    >
                      <option value="">-- Select Enclosure --</option>
                      {enclosureList.map((enc) => (
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
                <div className="form-row">
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
                <div className="form-row">
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
                  value={globalFilter || ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Table */}
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
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => (
                              <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                            ))}
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

            {/* Pagination */}
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span className="irf-showing-entries">
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, activeData.length)} of{" "}
                {activeData.length} entries
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