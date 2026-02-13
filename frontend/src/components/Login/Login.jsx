import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import axios from 'axios';


const Login = () => {
	const location = useLocation();


	
	const [showForgot, setShowForgot] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showOtpPopup, setShowOtpPopup] = useState(false);

	const [userid, setUserId] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;


	useEffect(() => {

	    const attemptTokenLogin = async () => {

	        const params = new URLSearchParams(location.search);
	        const token = params.get("token");

	        if (!token) {
	            console.log("No token found in URL");
	            return;
	        }

	        console.log("Token detected:", token);

	        try {
	            const response = await fetch(`${API_BASE_URL}api/auth/login`, {
	                method: "POST",
	                headers: { "Content-Type": "application/json" },
	                credentials: "include",
	                body: JSON.stringify({ token }),
	            });

	            const data = await response.json();
				
				if (!response.ok) {
				    console.error("Token login failed:", data);
				    return;
				}



	            localStorage.setItem("isLoggedIn", "true");
	            localStorage.setItem("userId", data.userId);
	            localStorage.setItem("userName", data.userName);
	            localStorage.setItem("userRoleNameFk", data.userRoleNameFk);
	            localStorage.setItem("userTypeFk", data.userTypeFk);
	            localStorage.setItem("departmentFk", data.departmentFk);
	            localStorage.setItem("loginDepartment", data.loginDepartment);
	            localStorage.setItem("designation", data.designation);

	            if (data.allowedContractIds) {
	                localStorage.setItem(
	                    "allowedContracts",
	                    JSON.stringify(data.allowedContractIds)
	                );
	            }


                navigate("/rfiSystem/dashboard");
              window.location.href = "/rfiSystem/dashboard";

	        } catch (error) {
	            console.error("Token login error:", error);
	        }
	    };

	    attemptTokenLogin();

	}, [location.search]);



	const showForgotPassword = () => {
		setShowForgot(true);
		setShowNewPassword(false);
		setShowOtpPopup(false);
	};

	const cancelForgotPassword = () => {
		setShowForgot(false);
		setShowNewPassword(false);
		setShowOtpPopup(false);
		setMessage('');
		setEmail('');
		setOtp('');
		setNewPassword('');
		setConfirmPassword('');
	};

	const openOtpPopup = async () => {
		if (!email) {
			alert('Please enter your email.');
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}api/forgot/send-otp`, {

				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emailId: email }),
			});

			const data = await response.json();
			if (response.ok) {
				alert(data.message);
				setShowOtpPopup(true);
			} else {
				alert('Failed to send OTP: ' + data.message);
			}
		} catch (error) {
			console.error('Error sending OTP:', error);
			alert('Error sending OTP');
		}
	};

	const submitOtp = async () => {
		if (!otp) {
			alert('Please enter the OTP.');
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}api/forgot/verify-otp`, {

				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emailId: email, otp: otp }),
			});

			const data = await response.json();
			if (response.ok) {
				alert(data.message);
				setShowOtpPopup(false);
				setShowForgot(false);
				setShowNewPassword(true);
			} else {
				alert('OTP verification failed: ' + data.message);
			}
		} catch (error) {
			console.error('Error verifying OTP:', error);
			alert('Error verifying OTP');
		}
	};

	const submitNewPassword = async () => {
		if (!newPassword || !confirmPassword) {
			alert('Both password fields are required.');
			return;
		}

		if (newPassword !== confirmPassword) {
			alert('Passwords do not match.');
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}api/forgot/reset-password`, {

				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					emailId: email, newPassword: newPassword, confirmPassword: confirmPassword,
				}),
			});

			const data = await response.json();
			if (response.ok) {
				alert(data.message);
				cancelForgotPassword();
			} else {
				alert('Password reset failed: ' + data.message);
			}
		} catch (error) {
			console.error('Error resetting password:', error);
			alert('Error resetting password');
		}
	};
	

//
//	useEffect(() => {
//
//	    const params = new URLSearchParams(location.search);
//	    const token = params.get("token");
//
//	    if (!token) return;
//
//	    const bootstrap = async () => {
//
//	        try {
//
//	            console.log("Token detected → bootstrapping session");
//
//	            const res = await axios.get(`${API_BASE_URL}api/auth/setsession`, {
//	                params: { token },
//	                withCredentials: true
//	            });
//
//	            const data = res.data;
//
//	            if (!data) {
//	                console.error("No session data returned");
//	                navigate("/login", { replace: true });
//	                return;
//	            }
//
//	            localStorage.setItem('isLoggedIn', 'true');
//	            localStorage.setItem('userId', data.userId);
//	            localStorage.setItem('userName', data.userName);
//	            localStorage.setItem('userRoleNameFk', data.userRoleNameFk);
//	            localStorage.setItem('userTypeFk', data.userTypeFk);
//	            localStorage.setItem('departmentFk', data.departmentFk);
//	            localStorage.setItem('loginDepartment', data.loginDepartment);
//	            localStorage.setItem('designation', data.designation);
//
//	            if (data.allowedContractIds) {
//	                localStorage.setItem(
//	                    'allowedContracts',
//	                    JSON.stringify(data.allowedContractIds)
//	                );
//	            }
//
//	            console.log("✅ Token login successful:", data.userId);
//
//	            const sessionRes = await axios.get(
//	                `${API_BASE_URL}api/auth/getsession`,
//	                { withCredentials: true }
//	            );
//
//	            if (!sessionRes.data) {
//	                console.error("Backend session missing");
//	                alert("Session not established");
//	                navigate("/login", { replace: true });
//	                return;
//	            }
//
//	            try {
//	                const checkRes = await axios.get(
//	                    `${API_BASE_URL}api/checkUserDSC`,
//	                    {
//	                        params: { userId: data.userId },
//	                        withCredentials: true
//	                    }
//	                );
//
//	                localStorage.setItem(
//	                    "askForDSC",
//	                    checkRes.data.exists ? "false" : "true"
//	                );
//
//	            } catch (err) {
//	                console.error("DSC check failed:", err);
//	                localStorage.setItem("askForDSC", "true");
//	            }
//
//	            // ✅ Clean token from URL
//	            window.history.replaceState({}, document.title, "/rfiSystem/dashboard");
//
//	            // ✅ Single navigation ONLY
//	            navigate("/rfiSystem/dashboard", { replace: true });
//
//	        } catch (err) {
//	            console.error("Session bootstrap failed:", err);
//	            localStorage.clear();
//	            navigate("/", { replace: true });
//	        }
//	    };
//
//	    bootstrap();
//
//	}, [location.search]);
//
//
//
//
//	const handleLogin = async (e) => {
//		e.preventDefault();
//		setMessage('');
//
//		try {
//			
//			const params = new URLSearchParams(location.search);
//			const token = params.get("token");
//			
//			
//			const response = await fetch(`${API_BASE_URL}api/auth/login`, {
//				method: 'POST',
//				headers: { 'Content-Type': 'application/json' },
//				credentials: 'include',
//				body: JSON.stringify({ userId: userid, password: password, token:token }),
//			});
//
//			const data = await response.json();
//			if (response.ok) {
//				localStorage.setItem('isLoggedIn', true);
//				localStorage.setItem('userId', data.userId);
//				localStorage.setItem('userName', data.userName);
//				localStorage.setItem('userRoleNameFk', data.userRoleNameFk);
//				localStorage.setItem('userTypeFk', data.userTypeFk);
//				localStorage.setItem('departmentFk', data.departmentFk);
//				localStorage.setItem('loginDepartment', data.loginDepartment);
//				localStorage.setItem('designation', data.designation);
//
//				console.log(localStorage.getItem('loginDepartment'));		
//				try {
//				    const checkRes = await fetch(
//				        `${API_BASE_URL}api/checkUserDSC?userId=${data.userId}`,
//				        { method: "GET", credentials: "include" }
//				    );
//				    const checkData = await checkRes.json();
// 
//				    if (checkData.exists) {
//				        localStorage.setItem("askForDSC", "false");   // Do NOT ask again
//				    } else {
//				        localStorage.setItem("askForDSC", "true");    // Ask for DSC
//				    }
//				} catch (err) {
//				    console.error("DSC check failed:", err);
//				    localStorage.setItem("askForDSC", "true"); // safe fallback
//				}	
//
//
//				if (data.allowedContractIds) {
//					localStorage.setItem('allowedContracts', JSON.stringify(data.allowedContractIds));
//				}
//
//				window.location.href = "/rfiSystem/dashboard";
//
//			} else {
//				setMessage(`❌ Login failed: ${data.message || 'Invalid credentials'}`);
//			}
//		} catch (error) {
//			console.error('Login error:', error);
//			setMessage('❌ An error occurred while logging in.');
//		}
//	};
	
	



const handleLogin = async (e) => {
		e.preventDefault();
		setMessage('');

		try {
			const response = await fetch(`${API_BASE_URL}api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ userId: userid, password: password }),
			});

			const data = await response.json();
			if (response.ok) {
				localStorage.setItem('isLoggedIn', true);
				localStorage.setItem('userId', data.userId);
				localStorage.setItem('userName', data.userName);
				localStorage.setItem('userRoleNameFk', data.userRoleNameFk);
				localStorage.setItem('userTypeFk', data.userTypeFk);
				localStorage.setItem('departmentFk', data.departmentFk);
				localStorage.setItem('loginDepartment', data.loginDepartment);
				localStorage.setItem('designation', data.designation);

				console.log(localStorage.getItem('loginDepartment'));		
				try {
				    const checkRes = await fetch(
				        `${API_BASE_URL}api/checkUserDSC?userId=${data.userId}`,
				        { method: "GET", credentials: "include" }
				    );
				    const checkData = await checkRes.json();
 
				    if (checkData.exists) {
				        localStorage.setItem("askForDSC", "false");   // Do NOT ask again
				    } else {
				        localStorage.setItem("askForDSC", "true");    // Ask for DSC
				    }
				} catch (err) {
				    console.error("DSC check failed:", err);
				    localStorage.setItem("askForDSC", "true"); // safe fallback
				}	


				if (data.allowedContractIds) {
					localStorage.setItem('allowedContracts', JSON.stringify(data.allowedContractIds));
				}

				window.location.href = "/rfiSystem/dashboard";

			} else {
				setMessage(`❌ Login failed: ${data.message || 'Invalid credentials'}`);
			}
		} catch (error) {
			console.error('Login error:', error);
			setMessage('❌ An error occurred while logging in.');
		}
	};

	return (
		<div className="login-page">
			<div className="login-banner-image">
				<img src="/images/login-side-image.png" alt="side" />
			</div>

			<div className="login-form">
				<div className="login-logo">
					<img src="/images/MRVC.webp" alt="Logo" width="250" height="250" />
				</div>
				<h2>{showNewPassword ? 'Set New Password' : showForgot ? 'Forgot Password' : 'Login'}</h2>

				{!showForgot && !showNewPassword && (
					<>
						<form onSubmit={handleLogin}>
							<label>Username:</label>
							<div className="form-fields">
								<input
									type="text"
									placeholder="Enter Username"
									value={userid}
									onChange={(e) => setUserId(e.target.value)}
									required
								/>
							</div>
							<label>Password:</label>
							<div className="form-fields">
								<input
									type="password"
									placeholder="Enter Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
							<div className="form-fields-checkbox">
								<input type="checkbox" id="remember_me" />
								<label htmlFor="remember_me">Remember Me</label>
							</div>
							<input type="submit" value="Login" />
						</form>
						<a href="#" className="forgot-password" onClick={showForgotPassword}>
							Forgot Password?
						</a>
					</>
				)}

				{message && (
					<div style={{ marginTop: '15px', color: message.includes('✅') ? 'green' : 'red' }}>
						{message}
					</div>
				)}

				{showForgot && (
					<div id="forgotPasswordSection">
						<form>
							<label>Enter Email:</label>
							<div className="form-fields">
								<input
									type="email"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="d-flex">
								<button type="button" className="btn btn-red" onClick={openOtpPopup}>
									Change
								</button>
								<button type="button" className="btn btn-white" onClick={cancelForgotPassword}>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{showNewPassword && (
					<div id="newPasswordSection">
						<form>
							<div className="form-fields">
								<input
									type="password"
									placeholder="Enter new password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
								/>
							</div>
							<div className="form-fields">
								<input
									type="password"
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
							</div>
							<div className="d-flex">
								<button type="button" className="btn btn-red" onClick={submitNewPassword}>
									Submit
								</button>
								<button type="button" className="btn btn-white" onClick={cancelForgotPassword}>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}
			</div>

			{showOtpPopup && (
				<div className="modal" id="otpPopup">
					<div className="modal-content">
						<div className="modal-heading d-flex justify-space-between align-center">
							<h3>Enter OTP</h3>
							<span className="btn-close" onClick={() => setShowOtpPopup(false)}></span>
						</div>
						<input
							type="text"
							placeholder="Enter OTP"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
						/>
						<div className="d-flex">
							<button type="button" className="btn btn-red" onClick={submitOtp}>
								Submit OTP
							</button>
							<button type="button" className="btn btn-white">Resend</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Login;
