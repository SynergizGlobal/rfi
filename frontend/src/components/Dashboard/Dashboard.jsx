import React, { useEffect, useState } from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
	const navigate = useNavigate();
	const [rfiCount, setRfiCount] = useState(0);

	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;



	const isContractor = userRole === "contractor";
	const isRegularUser = userRole === "regular user";
	const isITAdmin = userRole === "it admin";
	const isDyHOD = userType === "dyhod";

	const hasFullAccess = isITAdmin || isDyHOD;

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
		RESCHEDULED: 0
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

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}api/auth/session`, {
					method: 'GET',
					credentials: 'include',
				});

				if (response.status === 401) {
					alert('⚠️ Session expired. Please log in again.');
					localStorage.clear();
					navigate('/login');
				}
			} catch (error) {
				console.error('Session check failed:', error);
				alert('⚠️ Error checking session. Please log in again.');
				localStorage.clear();
				navigate('/login');
			}
		};

		checkSession();
	}, [navigate]);

	return (
		<div className="dashboard">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="home-body">
						<h1>Welcome to RFI System</h1>
						<div className="body-content">
							<div className="cards-section">
								{/* Card 1: Role-based navigation */}
								<div
									className="cards"
									onClick={() => {
										if (hasFullAccess) {
											navigate("/RfiLog");
										} else if (isContractor) {
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
												<span className="card-text">
													{hasFullAccess ? "RFI submitted" : isContractor ? "RFI created" : ""}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Card 2: Inspections */}
								<div className="cards">
									<div className="card-inner">
										<div className="card-top">
											<div className="card-count">
												<span className="card-number">{statusCounts.INSPECTION_DONE}</span>
											</div>
											<div className="cards-icon">
												<img src="/images/verify.png" alt="tick symbol" width="25" height="25" />
											</div>
										</div>
										<div className="card-bottom">
											<div className="card-title">
												<span className="card-text">Inspections</span>
											</div>
										</div>
									</div>
								</div>

								{/* Card 3: Pending */}
								<div className="cards">
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
												<span className="card-text">Pending</span>
											</div>
										</div>
									</div>
								</div>

								{/* Card 4: Rescheduled */}
								<div className="cards">
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
												<span className="card-text">Rescheduled</span>
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
};

export default Dashboard;
