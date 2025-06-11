import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [showForgot, setShowForgot] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

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
      const response = await fetch('http://localhost:8000/api/forgot/send-otp', {
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
      const response = await fetch('http://localhost:8000/api/forgot/verify-otp', {
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
      const response = await fetch('http://localhost:8000/api/forgot/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email, newPassword: newPassword }),
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userName: username, password: password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Login successful! Welcome, ${data.userName}`);
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
              <span className="btn-close" onClick={() => setShowOtpPopup(false)}>X</span>
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
