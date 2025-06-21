import React, { useMemo, useState, useEffect } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { useNavigate } from 'react-router-dom'; 
import HeaderRight from '../HeaderRight/HeaderRight';
import './CreatedRfi.css';

const CreatedRfi = () => {
  const [rfiData, setRfiData] = useState([]);
  const navigate = useNavigate(); 

  // Fetch data from backend on mount
  useEffect(() => {
    fetch('http://localhost:8000/rfi/rfi-details')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched RFI data:", data); 
        const transformed = data.map((item, index) => ({
			id: item.id,
          rfiId: item.rfi_Id,
          project: item.project,
          structureType: item.structureType,
          element: item.element,
          activity: item.activity,
          assignedPerson: item.nameOfRepresentative,
          submissionDate: item.dateOfSubmission || '',
          status: item.status,
        }));
        setRfiData(transformed);
      })
      .catch(error => {
        console.error('Error fetching RFI data:', error);
      });
  }, []);

  const handleEdit = (rfi) => {
      // Redirect to CreateRfi page with RFI ID
	  console.log("🟢 rfi object:", rfi); 
      navigate('/CreateRfi', { state: { id: rfi.id, mode: 'edit' } });
	  console.log("Navigating to edit with:", {rfiId: rfi.rfiId,mode: 'edit' });

    };

	const handleDelete = (rfi) => {
	  if (window.confirm(`Are you sure you want to delete RFI ${rfi.rfiId}?`)) {
		console.log("🟡 RFI Object to delete:", rfi);
		fetch(`http://localhost:8000/rfi/delete/${rfi.id}`, {
		  method: 'DELETE',
		  headers: { 'Content-Type': 'application/json' },
		})
	      .then((res) => {
	        if (res.ok) {
	          alert('RFI deleted successfully');
	          setRfiData(prev => prev.filter(item => item.id !== rfi.id));
	        } else {
	          alert(`Failed to delete RFI (Status: ${res.status})`);
	        }
	      })
	      .catch((err) => console.error('Error deleting RFI:', err));
	  }
	};

  const columns = useMemo(() => [
    { Header: 'RFI ID', accessor: 'rfiId' },
    { Header: 'Project', accessor: 'project' },
    { Header: 'Structure Type', accessor: 'structureType' },
    { Header: 'Element', accessor: 'element' },
    { Header: 'Activity', accessor: 'activity' },
    { Header: 'Assigned Person', accessor: 'assignedPerson' },
    { Header: 'Submission Date', accessor: 'submissionDate' },
    { Header: 'Status', accessor: 'status' },
	  {
	    Header: 'Actions',
	    id: 'actions',
		    Cell: ({ row }) => (
		      <div className="action-buttons">
		        <button className="edit-btn" onClick={() => handleEdit(row.original)}>
		          Edit
		        </button>
		        <button className="delete-btn" onClick={() => handleDelete(row.original)}>
		          Delete
		        </button>
		      </div>
		    )
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
    { columns, data: rfiData, initialState: { pageSize: 5 } },
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
