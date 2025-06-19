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
					<li><Link to="/dashboard"><div className="menu-text"><i className="fas fa-home"></i> <span>Home</span></div></Link></li>

					{(isContractor || hasFullAccess) && (
						<>
							<li><Link to="/CreateRfi"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Create RFI</span></div></Link></li>
							<li><Link to="/CreatedRfi"><div className="menu-text"><i className="fa-solid fa-file-pen"></i> <span>Update RFI</span></div></Link>
								{/*<span><i className="fa-solid fa-file-pen"></i> Update RFI <i className="fas fa-chevron-down"></i></span>
									<ul className="sub-menu">
									<li><Link to="/rfiSystem/upload-contract-schedules">Upload RFI</Link></li>
									<li><Link to="/rfiSystem/boqList">Select RFI</Link></li>
								</ul> */}
							</li>
							<li><Link to="/RfiLog"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
						</>
					)}

					{(isContractor || isRegularUser || hasFullAccess) && (
						<>
							<li><Link to="/Inspection"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span>Inspection</span></div></Link></li>

							{isRegularUser && (
								<>
									<li><Link to="/CreateRfi"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Validation</span></div></Link></li>
									<li><Link to="/rfiSystem/mbList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
								</>
							)}
						</>
					)}


					{hasFullAccess && (
						<li><Link to="/CreateRfi"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Validation</span></div></Link></li>
					)}

					{(isContractor || hasFullAccess) && (
						<li><Link><span><div className="menu-text"><i className="fa-solid fa-download"></i> <span>Download Enclosures</span></div> </span></Link></li>
					)}
				</ul>
			</div>
		</div>
	);
};

export default HeaderRight;
