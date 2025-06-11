import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeaderRight.css';

const HeaderRight = () => {
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
          <div className="mobile-close" onClick="closeSideBar()"><i className="fas fa-times-circle"></i></div>
          
          <ul className="dashboard-menu">
          <li><Link to="/rfiSystem/home"><div className="menu-text"><i className="fas fa-home"></i> <span className="menu-name">Home</span></div></Link></li>
          <li><Link to="/rfiSystem/upload-irussor"><div className="menu-text"><i className="fa-solid fa-print"></i> <span className="menu-name">Create RFI</span></div></Link></li>
          <li><span><div className="menu-text"><i className="fa-solid fa-file-pen"></i> <span className="menu-name">Update RFI</span></div> <i className="fas fa-chevron-down"></i></span>
            <ul className="sub-menu">
              <li><Link to="/rfiSystem/upload-contract-schedules"><div className="menu-text">Upload RFI</div></Link></li>
              <li><Link to="/rfiSystem/boqList">Select RFI</Link></li>
            </ul>
          </li>	
          <li><Link to="/rfiSystem/mbList"><div className="menu-text"><i className="fa-solid fa-file-invoice"></i><span className="menu-name">RFI Log</span></div></Link></li>
          <li><Link to="/rfiSystem/emb-validation"><div className="menu-text"><i className="fa-solid fa-folder-tree"></i> <span className="menu-name">Inspection</span></div></Link></li>
          <li><span><div className="menu-text"><i className="fa-solid fa-download"></i> <span className="menu-name">Download Enclosures</span></div> <i className="fas fa-chevron-down"></i></span>
            <ul className="sub-menu">
              <li><Link to="/rfiSystem/raBillsList">On Account Bill</Link></li>
              <li><Link to="/rfiSystem/finalBillsList">Final Bill</Link></li>
            </ul>
          </li>
          </ul>
        </div>			
      </div>
  );
};

export default HeaderRight;
