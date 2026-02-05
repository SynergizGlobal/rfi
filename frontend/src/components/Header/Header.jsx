import React from 'react';
import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {

	const [userName, setUserName] = useState('');

	useEffect(() => {
		const storedUser = localStorage.getItem('userName');
		if (storedUser) setUserName(storedUser);
	}, []);
	const sidemenu = () => {
		const leftSide = document.querySelector('.left');
		leftSide.classList.toggle('half-open');

		const menuItems = document.querySelectorAll('.dashboard-menu li');
		menuItems.forEach(item => item.classList.remove('active'));
	};

	return (<div className="top-nav">
		<div className="top-left-menu">
			<ul>
				<li>
					<span onClick={sidemenu}>&#8801;</span>
				</li>
			</ul>
			<Link to="/dashboard">
				<img src="/images/MRVC.webp" alt="logo" width="75" height="70" />
				Mumbai Railway Vikas Corporation
			</Link>
		</div>

		<div className="top-right-menu">
			<ul>
			{/*<li>
					<div className="notifications ping-bars">
						<i className="fas fa-bell"></i>
						<span className="ping-barstext">
							<div className="notifications-list">
								<ul>
									<li>E-MB not raised in last 15 days</li>
									<li>RA Bill No. X pending for approval.</li>
									<li>E-MB not raised in last 5 days</li>
								</ul>
							</div>
						</span>
					</div>
				</li>
				<li>
					<div className="messages ping-bars">
						<i className="fas fa-envelope"></i>
						<span className="ping-barstext">
							<div className="notifications-list">
								<ul>
									<li>E-MB not raised in last 15 days</li>
									<li>RA Bill No. X pending for approval.</li>
									<li>RA Bill No. X pending for approval.</li>
								</ul>
							</div>
						</span>
					</div>
				</li>*/}
				<li>
					<div className="user-menu">
						<div className="user-profile">
							<img src="/images/profile-image.png" alt="profile" width="30" height="30" />
						 {userName || 'User'}
							<i className="fas fa-chevron-down"></i>
						</div>
						<div className="profile-options">
							<ul>
								 <li>
									<a href="EditProfile">
										Edit Profile
									</a>
								</li>
								{/*<li>
									<Link to="">Change Password</Link>
								</li>*/}
								<li>
									<Link to="/login">Logout</Link>
								</li>
							</ul>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
	);
};

export default Header;
