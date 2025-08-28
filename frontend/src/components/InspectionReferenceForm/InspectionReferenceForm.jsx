import React, { useMemo, useState } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import HeaderRight from "../HeaderRight/HeaderRight";
import './InspectionReferenceForm.css';

const InspectionReferenceForm = () => {
  const [pageSize, setPageSize] = useState(10);
  const [selectedOption, setSelectedOption] = useState(""); // first dropdown
  const [subOption, setSubOption] = useState("sub1"); // sub dropdown

  // Table 1
  const table1Data = useMemo(() => [
    { sr_no: 1, activity: "Bore Log", rfi_description: "Bore Hole Drilling", enclosure_attachments: "Checklist" },
    { sr_no: 2, activity: "Site Survey", rfi_description: "Survey & Centre Point Fixing", enclosure_attachments: "Coordinate Sheet" },
    { sr_no: 3, activity: "Site Survey", rfi_description: "Layout and marking of excavation area", enclosure_attachments: "Checklist" },
  ], []);
  const table1Columns = useMemo(() => [
    { Header: "Sr No", accessor: "sr_no" },
    { Header: "Activity", accessor: "activity" },
    { Header: "RFI Description", accessor: "rfi_description" },
    { Header: "Enclosure/Attachments", accessor: "enclosure_attachments" },
  ], []);

  // Table 2 columns
  const table2Columns = useMemo(() => [
    { Header: "S. No", accessor: "sno" },
    { Header: "Reference Description", accessor: "description" },
  ], []);

  // Table 2 data sets for sub-options
  const subOptionDataMap = useMemo(() => ({
    sub1: [
      { sno: 1, description: "Bore Log Requirements" },
      { sno: 2, description: "Checklist Items - Borehole" },
    ],
    sub2: [
      { sno: 1, description: "Safety Guidelines"},
      { sno: 2, description: "PPE Requirements" },
    ],
    sub3: [
      { sno: 1, description: "Pile Depth Specs" },
      { sno: 2, description: "Testing Procedure" },
    ],
    sub4: [
      { sno: 1, description: "Concreting Process" },
      { sno: 2, description: "Shuttering Safety" },
      { sno: 3, description: "Reinforcement Details" },
    ],
  }), []);

  // memoize columns and data based only on dropdown states
  const activeColumns = useMemo(
    () => selectedOption === "second" ? table2Columns : table1Columns,
    [selectedOption, table1Columns, table2Columns]
  );
  const activeData = useMemo(
    () =>
      selectedOption === "second"
        ? subOptionDataMap[subOption] || []
        : table1Data,
    [selectedOption, subOption, table1Data, subOptionDataMap]
  );

  // useTable
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
      initialState: { pageIndex: 0, pageSize }
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
            <div className="form-row">
              <div className="form-fields">
                <label>Select Form: </label>
                <select
                  value={selectedOption}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="first">RFI Enclosure List</option>
                  <option value="second">Checklist Description</option>
                </select>
              </div>
              <div className="form-fields">
                {/* Second dropdown only shows if 'second' chosen */}
                {selectedOption === "second" && (
                  <>
                    <label>Sub Option: </label>
                    <select
                      value={subOption}
                      onChange={e => setSubOption(e.target.value)}
                    >
                      <option value="sub1">Bore Log Checklist</option>
                      <option value="sub2">Safety Checklist</option>
                      <option value="sub3">Pile Depth Checklist</option>
                      <option value="sub4">Concreting/Shuttering/Reinforcement</option>
                    </select>
                  </>
                )}
              </div>
            </div>
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
                      <option key={size} value={size}>{size}</option>
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
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span>
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, activeData.length)} of{" "}
                {activeData.length} entries
              </span>
              <div className="pagination">
                <button onClick={previousPage} disabled={!canPreviousPage}>‹</button>
                {pageOptions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => gotoPage(i)}
                    className={pageIndex === i ? "activePage" : ""}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={nextPage} disabled={!canNextPage}>›</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionReferenceForm;
