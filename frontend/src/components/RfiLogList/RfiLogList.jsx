import React, { useMemo, useState } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import './RfiLogList.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const data = [
  {
    rfiId: 'P4EN3/ABC/0115/RFI/00001/R1',
    rfiDate: '24-06-2025',
    rfiDescription: 'Building Works',
    rfiRequestedBy: 'Contractor',
    sentToDepartment: 'PCC',
    sentToPerson: 'Mr. Ramesh',
    dateRaised: '12-03-2025',
    dateResponded: '23-06-2025',
    status: 'Inspection done',
    notes: 'Nono',
    work: 'Virar Dahanu',
    contract: 'Lot-1 Station Improvement',
    view: '/downloads/sample1.pdf',
  },
  {
    rfiId: 'P4EN5/ABC/0115/RFI/00001/R1',
    rfiDate: '25-06-2025',
    rfiDescription: 'Earthwork',
    rfiRequestedBy: 'Engineer',
    sentToDepartment: 'Concreting',
    sentToPerson: 'Mr. Kamlesh',
    dateRaised: '',
    dateResponded: '',
    status: 'Rescheduled',
    notes: 'Nono',
    work: 'Panvel Karjat',
    contract: 'Lot-11 Station Improvement',
    view: '/downloads/sample2.pdf',
  },
];

const RfiLogList = () => {
  const [projectFilter, setProjectFilter] = useState('');
  const [workFilter, setWorkFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');

  const filteredData = useMemo(() => {
  return data.filter(item => {
    return (
      (!projectFilter || item.project === projectFilter) &&
      (!workFilter || item.work === workFilter) &&
      (!contractFilter || item.contract === contractFilter)
    );
  });
}, [data, projectFilter, workFilter, contractFilter]);


  const columns = useMemo(() => [
    { Header: 'RFI ID', accessor: 'rfiId' },
    { Header: 'RFI Date', accessor: 'rfiDate' },
    { Header: 'RFI Description', accessor: 'rfiDescription' },
    { Header: 'RFI Requested By', accessor: 'rfiRequestedBy' },
    {
      Header: 'RFI Sent To',
      columns: [
        { Header: 'Department', accessor: 'sentToDepartment' },
        { Header: 'Person', accessor: 'sentToPerson' }
      ]
    },
    { Header: 'Date Raised', accessor: 'dateRaised' },
    { Header: 'Date Responded', accessor: 'dateResponded' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Notes', accessor: 'notes' },
    {
      Header: 'View',
      accessor: 'view',
      Cell: ({ value }) =>
        value ? (
          <a href={value} download>
            <button className="download-btn">⬇</button>
          </a>
        ) : null
    }
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
    { columns, data: filteredData, initialState: { pageSize: 5 } },
    useGlobalFilter,
    usePagination
  );

  const { pageIndex, globalFilter, pageSize } = state;

  return (
    <div className="dashboard">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-table-container">
            <h2 className="section-heading">Created RFI List</h2>

            <div className="filters">
              <div className="form-row">
                <div className="form-fields">
                     <label>Projects</label>
                      <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                        <option value="">All Projects</option>
                        {[...new Set(data.map(d => d.project))].map((proj, idx) => (
                          <option key={idx} value={proj}>{proj}</option>
                        ))}
                      </select>
                </div>
                 
                <div className="form-fields">
                  <label>Work</label>
                  <select value={workFilter} onChange={(e) => setWorkFilter(e.target.value)}>
                    <option value="">All Works</option>
                    {[...new Set(data.map(d => d.work))].map((work, idx) => (
                      <option key={idx} value={work}>{work}</option>
                    ))}
                  </select>
                </div>
              
                <div className="form-fields">
                  <label>Contract</label>
                  <select value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
                    <option value="">All Contracts</option>
                    {[...new Set(data.map(d => d.contract))].map((contract, idx) => (
                      <option key={idx} value={contract}>{contract}</option>
                    ))}
                  </select>
                </div>
              </div>
                
            </div>

            <div className="table-top-bar d-flex justify-content-between align-items-center">
              <div className="left-controls">
                <label>
                  Show{' '}
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>{' '}
                  entries
                </label>
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <table {...getTableProps()} className="validation-table datatable" border={1}>
                <thead>
                  <tr>
                    {columns.map((col, idx) => {
                      if (col.columns) {
                        return (
                          <th key={idx} colSpan={col.columns.length} style={{ textAlign: 'center' }}>
                            {col.Header}
                          </th>
                        );
                      } else {
                        return (
                          <th key={idx} rowSpan={2}>
                            {col.Header}
                          </th>
                        );
                      }
                    })}
                  </tr>
                  <tr>
                    {columns.map(col =>
                      col.columns
                        ? col.columns.map((subCol, idx) => (
                            <th key={idx}>{subCol.Header}</th>
                          ))
                        : null
                    )}
                  </tr>
                </thead>

                <tbody {...getTableBodyProps()}>
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={i}>
                        {row.cells.map((cell, idx) => (
                          <td key={idx} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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

export default RfiLogList;
