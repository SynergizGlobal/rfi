import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeaderRight.css';

const HeaderRight = () => {

	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();

	// Normalize values to lowercase to avoid case mismatch issues
	const isContractor = userRole === "contractor";
	const isRegularUser = userRole === "regular user";
	const isITAdmin = userRole === "it admin";
	const isDyHOD = userType === "dyhod"; // Only from userType

	const hasFullAccess = isITAdmin || isDyHOD;

	useEffect(() => {
		const menuItems = document.querySelectorAll('.dashboard-menu li');
		const handleClick = (item) => () => {
			menuItems.forEach(el => el.classList.remove('active'));
			item.classList.toggle('active');
		};

		menuItems.forEach(item => {
			item.addEventListener('click', handleClick(item));
		});

		return () => {
			menuItems.forEach(item => {
				item.removeEventListener('click', handleClick(item));
			});
		};
	}, []);

	const closeSideBar = () => {
		const leftSide = document.querySelector('.left');
		leftSide.classList.remove('half-open');
	};

	return (
		<div className="left">
			<div className="scroll">
				<div className="mobile-close" onClick={closeSideBar}><i className="fas fa-times-circle"></i></div>

				<ul className="dashboard-menu">
					<li><Link to="/dashboard"><i className="fas fa-home"></i> Home</Link></li>

					{(isContractor || hasFullAccess) && (
						<>
							<li><Link to="/CreateRfi"><i className="fa-solid fa-print"></i> Create RFI</Link></li>
							<li><Link to="/CreatedRfi"><i className="fa-solid fa-file-pen"></i> Update RFI</Link>
								{/*<span><i className="fa-solid fa-file-pen"></i> Update RFI <i className="fas fa-chevron-down"></i></span>
									<ul className="sub-menu">
									<li><Link to="/rfiSystem/upload-contract-schedules">Upload RFI</Link></li>
									<li><Link to="/rfiSystem/boqList">Select RFI</Link></li>
								</ul> */}
							</li>
							<li><Link to="/rfiSystem/mbList"><i className="fa-solid fa-file-invoice"></i> RFI Log</Link></li>
						</>
					)}

					{(isContractor || isRegularUser || hasFullAccess) && (
						<>
							<li><Link to="/rfiSystem/emb-validation"><i className="fa-solid fa-folder-tree"></i> Inspection</Link></li>

							{isRegularUser && (
								<>
									<li><Link to="/CreateRfi"><i className="fa-solid fa-print"></i> Validation</Link></li>
									<li><Link to="/rfiSystem/mbList"><i className="fa-solid fa-file-invoice"></i> RFI Log</Link></li>
								</>
							)}
						</>
					)}


					{hasFullAccess && (
						<li><Link to="/CreateRfi"><i className="fa-solid fa-print"></i> Validation</Link></li>
					)}

					{(isContractor || hasFullAccess) && (
						<li><Link><span><i className="fa-solid fa-download"></i> Download Enclosures </span></Link></li>
					)}
				</ul>
			</div>
		</div>
	);
};

export default HeaderRight;
