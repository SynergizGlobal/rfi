import React, { useEffect } from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/session', {
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
                {/* card - 1 */}
                <div className="cards">
                  <Link to="/CreatedRfi">
                    <div className="card-inner">
                      <div className="card-top">
                        <div className="card-count">
                          <span className="card-number">100</span>
                        </div>
                        <div className="cards-icon">
                          <img src="/images/check-icon.png" alt="tick symbol" width="25" height="25" />
                        </div>
                      </div>
                      <div className="card-bottom">
                        <div className="card-title">
                          <span className="card-text">RFI created</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* card - 2 */}
                <div className="cards">
                  <div className="card-inner">
                    <div className="card-top">
                      <div className="card-count">
                        <span className="card-number">73</span>
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
                {/* card - 3 */}
                <div className="cards">
                  <div className="card-inner">
                    <div className="card-top">
                      <div className="card-count">
                        <span className="card-number">13</span>
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
                {/* card - 4 */}
                <div className="cards">
                  <div className="card-inner">
                    <div className="card-top">
                      <div className="card-count">
                        <span className="card-number">5</span>
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

              </div> {/* cards-section */}
            </div> {/* body-content */}
          </div> {/* home-body */}
        </div> {/* dashboard-main */}
      </div> {/* right */}
    </div> // dashboard
  );
};

export default Dashboard;
