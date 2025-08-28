import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import HeaderRight from "../HeaderRight/HeaderRight";
import "./ReferenceForm.css";

const ReferenceForm = () => {
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

  const handleAddRow = () => {
    const newRow = {
      sr_no: tableData.length + 1,
      activity: "",
      rfiDescription: "",
      enclosures: "",
      isNew: true,
      isEditing: false,
    };
    setTableData((prev) => [...prev, newRow]);
    setCurrentPage(Math.ceil((tableData.length + 1) / pageSize));
  };
 
  const ReferenceForm = ({ columns, data }) => { 
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // instead of rows
    prepareRow,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    usePagination
  );
};

  useEffect(() => {
    fetch(`${API_BASE_URL}rfi/Referenece-Form`)
      .then((res) => res.json())
      .then((data) => {
        const withSrNo = data.map((row, i) => ({
          sr_no: i + 1,
          activity: row.activity || "",
          rfiDescription: row.rfiDescription || "",
          enclosures: row.enclosures || "",
          id: row.id,
          isNew: false,
          isEditing: false,
        }));
        setTableData(withSrNo);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const filteredData = useMemo(() => {
    const lowerFilter = globalFilter.toLowerCase();
    return tableData.filter((row) =>
      row.activity.toLowerCase().includes(lowerFilter) ||
      row.rfiDescription.toLowerCase().includes(lowerFilter) ||
      row.enclosures.toLowerCase().includes(lowerFilter)
    );
  }, [tableData, globalFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleInputChange = (sr_no, field, value) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.sr_no === sr_no ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAction = (sr_no) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.sr_no === sr_no ? { ...row, isEditing: true } : row
      )
    );
  };

  const handleSubmit = async (rowData) => {
    try {
      const response = await fetch(`${API_BASE_URL}rfi/send-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: rowData.activity,
          rfiDescription: rowData.rfiDescription,
          enclosures: rowData.enclosures,
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        setTableData((prev) =>
          prev.map((r) =>
            r.sr_no === rowData.sr_no
              ? { ...r, id: saved.id, isNew: false }
              : r
          )
        );
        alert("Row submitted successfully!");
      } else {
        alert("Error submitting row");
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = async (rowData) => {
    if (!rowData.id) {
      alert("Row does not exist in DB yet.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}rfi/Update/${rowData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: rowData.activity,
          rfiDescription: rowData.rfiDescription,
          enclosures: rowData.enclosures,
        }),
      });

      if (response.ok) {
        setTableData((prev) =>
          prev.map((r) =>
            r.sr_no === rowData.sr_no ? { ...r, isEditing: false } : r
          )
        );
        alert("Row updated successfully!");
      } else {
        alert("Error updating row");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="dashboard credted-rfi inspection">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">Reference Form</h2>

            <div className="table-top-bar d-flex justify-content-between align-items-center">
              <div className="left-controls">
                <label>
                  Show{" "}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
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
              <div className="right-controls d-flex gap-2">
                <input
                  className="search-input"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search RFI..."
                />
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleAddRow}
                >
                  Add Row
                </button>
              </div>
            </div>

            <div className="table-section">
              <div className="table-wrapper">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Activity</th>
                      <th>RFI Description</th>
                      <th>Enclosure/Attachments</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row) => (
                      <tr key={row.sr_no}>
                        <td>{row.sr_no}</td>
                        <td>
                          {row.isNew || row.isEditing ? (
                            <input
                              value={row.activity}
                              onChange={(e) =>
                                handleInputChange(
                                  row.sr_no,
                                  "activity",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.activity
                          )}
                        </td>
                        <td>
                          {row.isNew || row.isEditing ? (
                            <input
                              value={row.rfiDescription}
                              onChange={(e) =>
                                handleInputChange(
                                  row.sr_no,
                                  "rfiDescription",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.rfiDescription
                          )}
                        </td>
                        <td>
                          {row.isNew || row.isEditing ? (
                            <input
                              value={row.enclosures}
                              onChange={(e) =>
                                handleInputChange(
                                  row.sr_no,
                                  "enclosures",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            row.enclosures
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              if (row.isNew) {
                                handleSubmit(row);
                              } else if (row.isEditing) {
                                handleEdit(row);
                              } else {
                                handleAction(row.sr_no);
                              }
                            }}
                          >
                            {row.isNew
                              ? "Submit"
                              : row.isEditing
                              ? "Save"
                              : "Edit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

			<div className="pagination-bar">
			  <button
			    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
			    disabled={currentPage === 1}
			  >
			    &lt; Prev
			  </button>
			  <span>
			    Page <strong>{currentPage} of {totalPages}</strong>
			  </span>
			  <button
			    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
			    disabled={currentPage === totalPages}
			  >
			    Next &gt;
			  </button>
			</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceForm;