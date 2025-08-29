import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import axios from "axios"; 
import HeaderRight from "../HeaderRight/HeaderRight";
import './InspectionReferenceForm.css';

const InspectionReferenceForm = () => {
  const [pageSize, setPageSize] = useState(10);
  const [selectedOption, setSelectedOption] = useState(""); // first dropdown
  const [subOption, setSubOption] = useState(""); // sub dropdown (dynamic)
  const [openEnclosers, setOpenEnclosers] = useState([]); // for RFI Enclosure List table
  const [enclosureList, setEnclosureList] = useState([]); // sub dropdown options
  const [checklistItems, setChecklistItems] = useState([]); // checklist table rows

  // 🔹 Load encloser list for dropdown when "Checklist Description" selected
  useEffect(() => {
    if (selectedOption === "second") {
      axios.get("http://localhost:8000/rfi/open")
        .then((res) => setEnclosureList(res.data))
        .catch((err) => console.error("Error fetching enclosure list:", err));
    }
  }, [selectedOption]);

  // 🔹 Load all open enclosers (for table 1)
  useEffect(() => {
    axios.get("http://localhost:8000/rfi/open")
      .then(res => setOpenEnclosers(res.data))
      .catch(err => console.error("Error fetching enclosers:", err));
  }, []);

  // 🔹 Fetch checklist descriptions dynamically when subOption changes
  useEffect(() => {
    if (selectedOption === "second" && subOption) {
      axios
        .get("http://localhost:8000/rfi/checklistDescription", {
          params: { enclosureName: subOption },
        })
        .then((res) => {
          // Example backend response: ["Item1,Item2,Item3"]
          const splitItems = res.data
            .flatMap((item) => item.split(",")) // split by comma
            .map((s, i) => ({
              sno: i + 1,
              description: s.trim(),
            }));

          setChecklistItems(splitItems);
        })
        .catch((err) => console.error("Error fetching checklist:", err));
    }
  }, [selectedOption, subOption]);

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

            {/* Dropdowns */}
            <div className="form-row">
              <div className="form-fields">
                <label>Select Form: </label>
                <select
                  value={selectedOption}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    setSubOption("");
                    setChecklistItems([]);
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
                      value={subOption}
                      onChange={(e) => setSubOption(e.target.value)}
                    >
                      <option value="">-- Select Enclosure --</option>
                      {enclosureList.map((enc, idx) => (
                        <option key={idx} value={enc}>
                          {enc}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* Table Controls */}
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

            {/* Table */}
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

            {/* Pagination */}
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

export default InspectionReferenceForm;
