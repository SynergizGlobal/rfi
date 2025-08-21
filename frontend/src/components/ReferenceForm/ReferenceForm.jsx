import React, { useMemo, useState } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import './ReferenceForm.css';

const ReferenceForm = () => {
  const [pageSize, setPageSize] = useState(10);

  // ✅ Static data from the provided table image
  const data = useMemo(() => [
    { sr_no: 1, activity: "Bore Log", rfi_description: "Bore Hole Drilling", enclosure_attachments: "Checklist" },
    { sr_no: 2, activity: "Site Survey", rfi_description: "Survey & Centre Point Fixing", enclosure_attachments: "Coordinate Sheet" },
    { sr_no: 3, activity: "Site Survey", rfi_description: "Layout and marking of excavation area", enclosure_attachments: "Checklist" },
    { sr_no: 4, activity: "Site Survey", rfi_description: "Under Ground Utility Checking", enclosure_attachments: "Underground Utility clearance Joint Report" },
    { sr_no: 5, activity: "Piling", rfi_description: "Start of Pile Boring Work", enclosure_attachments: "Pile data, Coordinate, Work permit" },
    { sr_no: 6, activity: "Piling", rfi_description: "Pile Depth Checking", enclosure_attachments: "Checklist" },
    { sr_no: 7, activity: "Piling", rfi_description: "Reinforcement Cage Checking", enclosure_attachments: "BBS Sheet" },
    { sr_no: 8, activity: "Piling", rfi_description: "Steel Cage lowering and approval of concreting for Concreting", enclosure_attachments: "BBS Sheet, Checklist (Concrete), Pile data, Pour card" },
    { sr_no: 9, activity: "Excavation", rfi_description: "Layout Marking for Excavation", enclosure_attachments: "Excavation checklist, Level & Coordinate sheet" },
    { sr_no: 10, activity: "Excavation", rfi_description: "Excavation for Footing/Pile cap", enclosure_attachments: "Method of Statement for Excavation, Checklist" },
    { sr_no: 11, activity: "PCC", rfi_description: "PCC", enclosure_attachments: "Level Sheet, Checklist" },
    { sr_no: 12, activity: "Footing/Pile Cap", rfi_description: "Pile Cap Reinforcement & Shutter Checking", enclosure_attachments: "BBS Sheet, Checklist (Shuttering)" },
    { sr_no: 13, activity: "Footing/Pile Cap", rfi_description: "Allow for concreting for Footing/Pile Cap", enclosure_attachments: "Checklist (Concrete), Measurement Sheet, Pour Card" },
    { sr_no: 14, activity: "Sub Structure", rfi_description: "Reinforcement & Shutter Checking", enclosure_attachments: "BBS Sheet and Checklist (Shuttering)" },
    { sr_no: 15, activity: "Sub Structure", rfi_description: "Allow for Concreting for Substructure", enclosure_attachments: "Checklist (Concrete), Measurement Sheet, Pour Card" },
    { sr_no: 16, activity: "Pedestal", rfi_description: "Pedestal Reinforcement, Shutter Checking", enclosure_attachments: "BBS and checklist (Shutter)" },
    { sr_no: 17, activity: "Pedestal", rfi_description: "Pedestal Layout Marking & level Checking", enclosure_attachments: "Coordinate Sheet" },
  ], []);

  const columns = useMemo(() => [
    { Header: 'Sr No', accessor: 'sr_no' },
    { Header: 'Activity', accessor: 'activity' },
    { Header: 'RFI Description', accessor: 'rfi_description' },
    { Header: 'Enclosure/Attachments', accessor: 'enclosure_attachments' },
  ], []);

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
      data,
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
                  Show{' '}
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
                  </select>{' '}
                  entries
                </label>
              </div>
              <div className="right-controls">
                <input
                  className="search-input"
                  value={globalFilter || ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search RFI..."
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
                          <th {...col.getHeaderProps()}>{col.render('Header')}</th>
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
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
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
                Showing {pageIndex * pageSize + 1} to{' '}
                {Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length} entries
              </span>
              <div className="pagination">
                <button onClick={previousPage} disabled={!canPreviousPage}>
                  ‹
                </button>
                {pageOptions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => gotoPage(i)}
                    className={pageIndex === i ? 'activePage' : ''}
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
