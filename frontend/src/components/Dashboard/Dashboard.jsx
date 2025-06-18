import React from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
  <div classNameName="dashboard">
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
                      <span className="card-text">Inspections </span>
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

            </div>
            




          </div>
        </div>
                  
                  
                      
                </div>
              </div>
                
                      

            </div>
);
};

export default Dashboard;
