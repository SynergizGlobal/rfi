import React, { useMemo, useState } from "react";
import { useTable, usePagination, useGlobalFilter } from "react-table";
import HeaderRight from "../HeaderRight/HeaderRight";
import "./ReferenceForm.css";

const ReferenceForm = () => {
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState([
    {
      sr_no: 1,
      activity: "Bore Log",
      rfi_description: "Bore Hole Drilling",
      enclosure_attachments: "Checklist",
      isNew: false,
    },
    {
      sr_no: 2,
      activity: "Site Survey",
      rfi_description: "Survey & Centre Point Fixing",
      enclosure_attachments: "Coordinate Sheet",
      isNew: false,
    },
    {
      sr_no: 3,
      activity: "Site Survey",
      rfi_description: "Layout and marking of excavation area",
      enclosure_attachments: "Checklist",
      isNew: false,
    },
    {
      sr_no: 4,
      activity: "Site Survey",
      rfi_description: "Under Ground Utility Checking",
      enclosure_attachments: "Underground Utility clearance Joint Report",
      isNew: false,
    },
  ]);

  const handleAction = (sr_no) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.sr_no === sr_no ? { ...row, isNew: !row.isNew } : row
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

  const handleAddRow = () => {
    const newRow = {
      sr_no: tableData.length + 1,
      activity: "",
      rfi_description: "",
      enclosure_attachments: "",
      isNew: true,
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const columns = useMemo(
    () => [
      { Header: "Sr No", accessor: "sr_no" },
      {
        Header: "Activity",
        accessor: "activity",
        Cell: ({ row }) =>
          row.original.isNew ? (
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
        accessor: "rfi_description",
        Cell: ({ row }) =>
          row.original.isNew ? (
            <input
              value={row.original.rfi_description}
              onChange={(e) =>
                handleInputChange(
                  row.original.sr_no,
                  "rfi_description",
                  e.target.value
                )
              }
            />
          ) : (
            row.original.rfi_description
          ),
      },
      {
        Header: "Enclosure/Attachments",
        accessor: "enclosure_attachments",
        Cell: ({ row }) =>
          row.original.isNew ? (
            <input
              value={row.original.enclosure_attachments}
              onChange={(e) =>
                handleInputChange(
                  row.original.sr_no,
                  "enclosure_attachments",
                  e.target.value
                )
              }
            />
          ) : (
            row.original.enclosure_attachments
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
              onClick={() => handleAction(rowData.sr_no)}
            >
              {rowData.isNew ? "Submit" : "Edit"}
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
