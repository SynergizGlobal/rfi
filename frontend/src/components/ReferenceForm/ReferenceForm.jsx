import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import HeaderRight from "../HeaderRight/HeaderRight";
import "./ReferenceForm.css";

const ReferenceForm = () => {
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState([]);
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
	
	const [newRowAdded, setNewRowAdded] = useState(false);
	const currentPageRef = useRef(0);

	const handleAddRow = () => {
		const newRow = {
			
		  activity: "",
		  rfiDescription: "",
		  enclosures: "",
		  isNew: true,
		  isEditing: false,
		};

	  setTableData((prev) => [...prev, newRow]);
	  setNewRowAdded(true); // ✅ Flag that a new row was added
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
	  
	  const [currentPage, setCurrentPage] = useState(1);
	  const rowsPerPage = 10;

	  // Example pagination change handler
	  const handlePageChange = (page) => {
	    setCurrentPage(page);
	  };
	  
	  const paginatedData = tableData.slice(
	    (currentPage - 1) * rowsPerPage,
	    currentPage * rowsPerPage
	  );

	  // When adding/updating row, don't reset currentPage
	  const handleAction = (sr_no) => {
	    setTableData((prev) =>
	      prev.map((row) =>
	        row.sr_no === sr_no ? { ...row, isEditing: true } : row
	      )
	    );
	  };    

  const handleInputChange = (sr_no, field, value) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.sr_no === sr_no ? { ...row, [field]: value } : row
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

    // 🔹 Update existing row
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
	          r.sr_no === rowData.sr_no
	            ? { ...r, isEditing: false }
	            : r
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
	
  const columns = useMemo(
    () => [
		{
		   Header: "Sr No",
		   accessor: "sr_no",
		   Cell: ({ row }) => pageIndex * pageSize + row.index + 1,
		 },
      {
        Header: "Activity",
        accessor: "activity",
		Cell: ({ row }) =>
		  row.original.isNew || row.original.isEditing ? (
		    <input
		      value={row.original.activity}
		      onChange={(e) =>
		        handleInputChange(row.original.sr_no, "activity", e.target.value)
		      }
		    />
		  ) : (
		    row.original.activity
		  ),
      },
      {
        Header: "RFI Description",
        accessor: "rfiDescription",
        Cell: ({ row }) =>
         row.original.isNew || row.original.isEditing ? (
            <input
              value={row.original.rfiDescription}
              onChange={(e) =>
                handleInputChange(
                  row.original.sr_no,
                  "rfiDescription",
                  e.target.value
                )
              }
            />
          ) : (
            row.original.rfiDescription
          ),
      },
      {
        Header: "Enclosure/Attachments",
        accessor: "enclosures",
        Cell: ({ row }) =>
          row.original.isNew || row.original.isEditing ? (
            <input
              value={row.original.enclosures}
              onChange={(e) =>
                handleInputChange(
                  row.original.sr_no,
                  "enclosures",
                  e.target.value
                )
              }
            />
          ) : (
            row.original.enclosures
          ),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => {
          const rowData = row.original;
          return (
			<button
			  className="btn btn-sm btn-primary"
			  onClick={() => {
			    if (rowData.isNew) {
			      handleSubmit(rowData);
			    } else if (rowData.isEditing) {
			      handleEdit(rowData);
			    } else {
			      handleAction(rowData.sr_no); // toggles isEditing
			    }
			  }}
			>
			  {rowData.isNew
			    ? "Submit"
			    : rowData.isEditing
			    ? "Save"
			    : "Edit"}
			</button>
          );
        },
      },
    ],
    [] // ⬅️ keep columns stable
  );

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
      columns,
      data: tableData,
      initialState: {
        pageIndex: currentPageRef.current, 
        pageSize,
      },
    },
    useGlobalFilter,
    usePagination
  );
  
  useEffect(() => {
    if (newRowAdded) {
      const newPage = Math.ceil(tableData.length / pageSize);
      currentPageRef.current = newPage - 1; // ✅ Track page
      gotoPage(currentPageRef.current);
      setNewRowAdded(false);
    }
  }, [tableData, pageSize, gotoPage, newRowAdded]);
  
  
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
              <div className="right-controls d-flex gap-2">
                <input
                  className="search-input"
                  value={globalFilter || ""}
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
                <table {...getTableProps()} className="responsive-table">
                  <thead>
                    {headerGroups.map((group) => (
                      <tr {...group.getHeaderGroupProps()}>
                        {group.headers.map((col) => (
                          <th {...col.getHeaderProps()}>
                            {col.render("Header")}
                          </th>
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
                            <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
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
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, tableData.length)} of{" "}
                {tableData.length} entries
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
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceForm;