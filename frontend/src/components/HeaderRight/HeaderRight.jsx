import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeaderRight.css';

const HeaderRight = () => {
	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
	const loginDepartment = localStorage.getItem("loginDepartment")?.toLowerCase();

	const isContractor = userRole === "contractor" && loginDepartment !== "engg";
	const isRegularUser = userRole === "regular user";
	const isITAdmin = userRole === "it admin";
	const isDyHOD = userType === "dyhod";
	const isEnggDept = loginDepartment === "engg";

	useEffect(() => {
		const menuItems = document.querySelectorAll('.dashboard-menu li');
		const handleClick = (item) => () => {
			menuItems.forEach(el => el.classList.remove('active'));
			item.classList.add('active');
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
				<div className="mobile-close" onClick={closeSideBar}>
					<i className="fas fa-times-circle"></i>
				</div>

				<ul className="dashboard-menu">
					<li><Link to="/dashboard"><div className="menu-text"><i className="fas fa-home"></i> <span>Home</span></div></Link></li>

					{/* Engineer Department Specific */}
					{isEnggDept && !isContractor && !isITAdmin && (
						<>
							<li><Link to="/Inspection"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span>Inspection</span></div></Link></li>
							<li><Link to="/AssignExecutive"><div className="menu-text"><i className="fa-solid fa-code-pull-request"></i> <span>Assign Executive</span></div></Link></li>
							<li><Link to="/Validation"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Validation</span></div></Link></li>
							<li><Link to="/RfiLogList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
						</>
					)}

					{/* Contractor Menu */}
					{isContractor && (
						<>
							<li><Link to="/CreateRfi"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Create RFI</span></div></Link></li>
							<li><Link to="/CreatedRfi"><div className="menu-text"><i className="fa-solid fa-file-pen"></i> <span>Update RFI</span></div></Link></li>
							<li><Link to="/RfiLogList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
							<li><Link to="/Inspection"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span>Inspection</span></div></Link></li>
							<li><Link to="#"><div className="menu-text"><i className="fa-solid fa-download"></i> <span>Download Enclosures</span></div></Link></li>
						</>
					)}

					{/* IT Admin Menu */}
					{isITAdmin && (
						<>
							<li><Link to="/CreateRfi"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Create RFI</span></div></Link></li>
							<li><Link to="/CreatedRfi"><div className="menu-text"><i className="fa-solid fa-file-pen"></i> <span>Update RFI</span></div></Link></li>
							<li><Link to="/Inspection"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span>Inspection</span></div></Link></li>
							<li><Link to="/RfiLogList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
							<li><Link to="/Validation"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Validation</span></div></Link></li>
							<li><Link to="/AssignExecutive"><div className="menu-text"><i className="fa-solid fa-code-pull-request"></i> <span>Assign Executive</span></div></Link></li>
							<li><Link to="/ReferenceForm"><div className="menu-text"><i className="fa-solid fa-copy"></i> <span>Reference Form</span></div></Link></li>
							<li><Link to="/InspectionReferenceForm"><div className="menu-text"><i className="fa-solid fa-copy"></i> <span>Inspection Reference Form</span></div></Link></li>
							<li><Link to="#"><div className="menu-text"><i className="fa-solid fa-download"></i> <span>Download Enclosures</span></div></Link></li>
						</>
					)}

					{/* Regular User Menu - Restricted */}
					{!isEnggDept && isRegularUser && !isITAdmin && (
						<>
							<li><Link to="/Inspection"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span>Inspection</span></div></Link></li>
							<li><Link to="/Validation"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Validation</span></div></Link></li>
							<li><Link to="/RfiLogList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
						</>
					)}

					{/* DyHOD Menu - Keep Full Access */}
					{!isEnggDept && isDyHOD && !isITAdmin && (
						<>
							<li><Link to="/Inspection"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span>Inspection</span></div></Link></li>
							<li><Link to="/Validation"><div className="menu-text"><i className="fa-solid fa-print"></i> <span>Validation</span></div></Link></li>
							<li><Link to="/ReferenceForm"><div className="menu-text"><i className="fa-solid fa-copy"></i> <span>Reference Form</span></div></Link></li>
							<li><Link to="/InspectionReferenceForm"><div className="menu-text"><i className="fa-solid fa-copy"></i> <span>Inspection Reference Form</span></div></Link></li>
							<li><Link to="/RfiLogList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i> <span>RFI Log</span></div></Link></li>
						</>
					)}
				</ul>
			</div>
		</div>
	);
};

export default HeaderRight;
