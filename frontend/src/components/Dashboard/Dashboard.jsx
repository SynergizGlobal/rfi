import React, { useEffect, useState, useRef } from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
	const navigate = useNavigate();
	const [rfiCount, setRfiCount] = useState(0);

	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
	const userDepartment = localStorage.getItem("departmentFk")?.toLowerCase();
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;



	const isContractor = userRole === "contractor";
	const isRegularUser = userRole === "regular user";
	const isITAdmin = userRole === "it admin";
	const isDyHOD = userType === "dyhod";
	const isEngg = userDepartment === "engg";

	const hasFullAccess = isITAdmin || isDyHOD;

	// Inside Dashboard component
	const navigateWithStatus = (status) => {
		navigate("/CreatedRfi", { state: { filterStatus: status } });
	};

	useEffect(() => {

		fetch(`${API_BASE_URL}rfi/rfi-count`, {
			method: 'GET',
			credentials: 'include',
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to fetch RFI count");
				}
				return res.json();
			})
			.then((data) => setRfiCount(data))
			.catch((err) => {
				console.error("Failed to fetch RFI count:", err);
			});
	}, []);

	const [statusCounts, setStatusCounts] = useState({
		INSPECTION_DONE: 0,
		PENDING: 0,
		RESCHEDULED: 0,
		INSPECTED_BY_AE: 0,
		ACCEPTED: 0,
		REJECTED: 0
	});

	useEffect(() => {
		fetch(`${API_BASE_URL}rfi/status-counts`, {
			method: "GET",
			credentials: "include"
		})
			.then(res => {
				if (!res.ok) throw new Error("Failed to fetch RFI status counts");
				return res.json();
			})
			.then(data => setStatusCounts(data))
			.catch(err => {
				console.error("Failed to fetch status counts:", err);
			});
	}, []);
	
	const containerRef = useRef(null);
	
	useEffect(() => {
	  const container = containerRef.current;
	  const items = container.querySelectorAll(".cards");
	  const total = items.length;
	  if (total === 0) return;

	  const perRow = Math.ceil(total / 2);
	  const width = 100 / perRow;

	  items.forEach((item) => {
	    item.style.flex = `1 1 calc(${width}% - 6%)`;
	  });
	},[]);


	return (
		<div className="dashboard">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="home-body">
						<h1>Welcome to RFI System</h1>
						<div className="body-content">
							<div className="cards-section" ref={containerRef}>
								{/* Card 1: Role-based navigation */}
								<div
									className="cards"
									onClick={() => {
										if (hasFullAccess) {
											navigate("/RfiLog");
										} else if (isContractor || isEngg || isRegularUser) {
											navigate("/CreatedRfi");
										}
									}}
									style={{ cursor: 'pointer' }}
								>
									<div className="card-inner">
										<div className="card-top">
											<div className="card-count">
												<span className="card-number">{rfiCount}</span>
											</div>
											<div className="cards-icon">
												<img src="/images/check-icon.png" alt="tick symbol" width="25" height="25" />
											</div>
										</div>
										<div className="card-bottom">
											<div className="card-title">
												 <span className="card-text">RFI Created</span>
										
											</div>
										</div>
									</div>
								</div>


							{/* Card 2: Pending */}
							{!(isEngg || isDyHOD) && (
							   <>
							     {/* RFI Scheduled */}
							     <div
							       className="cards"
							       onClick={() =>
							         navigate("/Inspection", { state: { filterStatus: ["CREATED", "UPDATED", "REASSIGNED", "CON_INSP_ONGOING"] } })
							       }
							       style={{ cursor: "pointer" }}
							     >
							       <div className="card-inner">
							         <div className="card-top">
							           <div className="card-count">
							             <span className="card-number">{statusCounts.PENDING}</span>
							           </div>
							           <div className="cards-icon">
							             <img src="/images/caution.png" alt="tick symbol" width="25" height="25" />
							           </div>
							         </div>
							         <div className="card-bottom">
							           <div className="card-title">
							             <span className="card-text">RFI Scheduled</span>
							           </div>
							         </div>
							       </div>
							     </div>

							     {/* RFI Rescheduled */}
							     <div
							       className="cards"
							       onClick={() =>
							         navigate("/CreatedRfi", { state: { filterStatus: ["RESCHEDULED"] } })
							       }
							       style={{ cursor: "pointer" }}
							     >
							       <div className="card-inner">
							         <div className="card-top">
							           <div className="card-count">
							             <span className="card-number">{statusCounts.RESCHEDULED}</span>
							           </div>
							           <div className="cards-icon">
							             <img src="/images/calender.png" alt="tick symbol" width="25" height="25" />
							           </div>
							         </div>
							         <div className="card-bottom">
							           <div className="card-title">
							             <span className="card-text">RFI Rescheduled</span>
							           </div>
							         </div>
							       </div>
							     </div>
							   </>
							 )}
								
								{/* Card 4: Inspections */}
								<div
									className="cards"
									onClick={() => navigate("/Inspection", { state: { filterStatus: ["INSPECTED_BY_CON"] } })}
									style={{ cursor: 'pointer' }}
								>
									<div className="card-inner">
										<div className="card-top">
											<div className="card-count">
												<span className="card-number">{statusCounts.INSPECTED_BY_CON}</span>
											</div>
											<div className="cards-icon">
												<img src="/images/verify.png" alt="tick symbol" width="25" height="25" />
											</div>
										</div>
										<div className="card-bottom">
											<div className="card-title">
												<span className="card-text">RFI Submitted</span>
											</div>
										</div>
									</div>
								</div>
								
								{/* Card 5: Rescheduled */}
								<div
									className="cards"
									onClick={() => navigate("/Inspection", { state: { filterStatus: ["INSPECTED_BY_AE"] } })}
									style={{ cursor: 'pointer' }}
								>
									<div className="card-inner">
										<div className="card-top">
											<div className="card-count">
												<span className="card-number">{statusCounts.ACCEPTED}</span>
											</div>
											<div className="cards-icon">
												<img src="/images/calender.png" alt="tick symbol" width="25" height="25" />
											</div>
										</div>
										<div className="card-bottom">
											<div className="card-title">
												<span className="card-text">RFI Accepted</span>
											</div>
										</div>
									</div>
								</div>
								
								{/* Card 6: Rescheduled */}
								<div
									className="cards"
									onClick={() => navigate("/Inspection", { state: { filterStatus: ["INSPECTION_DONE"] } })}
									style={{ cursor: 'pointer' }}
								>
									<div className="card-inner">
										<div className="card-top">
											<div className="card-count">
												<span className="card-number">{statusCounts.REJECTED}</span>
											</div>
											<div className="cards-icon">
												<img src="/images/calender.png" alt="tick symbol" width="25" height="25" />
											</div>
										</div>
										<div className="card-bottom">
											<div className="card-title">
												<span className="card-text">RFI Rejected</span>
											</div>
										</div>
									</div>
								</div>

							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
