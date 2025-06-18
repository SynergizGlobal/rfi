import React, { useMemo } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import HeaderRight from '../HeaderRight/HeaderRight';
import './CreatedRfi.css';

const data = [
  {
    rfiId: 'P4EN3/ABC/0115/RFI/00001/R1',
    project: 'Panvel Karjat',
    structureType: 'Building Works',
    element: 'Foundation',
    activity: 'PCC',
    assignedPerson: 'Mr. Ramesh',
    submissionDate: '12-03-2025',
    status: 'Inspection done',
  },
  {
    rfiId: 'P4EN5/ABC/0115/RFI/00001/R1',
    project: 'Panvel Karjat',
    structureType: 'Earthwork',
    element: 'Pier',
    activity: 'Concreting',
    assignedPerson: 'Mr. Kamlesh',
    submissionDate: '',
    status: 'Rescheduled',
  },
];

const CreatedRfi = () => {
  const columns = useMemo(() => [
    { Header: 'RFI ID', accessor: 'rfiId' },
    { Header: 'Project', accessor: 'project' },
    { Header: 'Structure Type', accessor: 'structureType' },
    { Header: 'Element', accessor: 'element' },
    { Header: 'Activity', accessor: 'activity' },
    { Header: 'Assigned Person', accessor: 'assignedPerson' },
    { Header: 'Submission Date', accessor: 'submissionDate' },
    { Header: 'Status', accessor: 'status' },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    setGlobalFilter,
    setPageSize,
  } = useTable(
    { columns, data, initialState: { pageSize: 5 } },
    useGlobalFilter,
    usePagination
  );

  const { pageIndex, globalFilter, pageSize } = state;

  return (
    <div className="dashboard credted-rfi">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">Created RFI List</h2>

            <div className="table-top-bar d-flex justify-content-between align-items-center">
              <div className="left-controls">
                <label>
                  Show{' '}
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 20, 50].map(size => (
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
                  onChange={e => setGlobalFilter(e.target.value)}
                  placeholder="Search RFI..."
                />
              </div>
            </div>

            <table {...getTableProps()} className="rfi-table datatable" border={1}>
              <thead>
                {headerGroups.map(group => (
                  <tr {...group.getHeaderGroupProps()}>
                    {group.headers.map(column => (
                      <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pagination-bar">
              <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                &lt; Prev
              </button>
              <span>
                Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
              </span>
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatedRfi;
