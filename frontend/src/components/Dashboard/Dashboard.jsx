import React, { useEffect, useState, useRef } from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { jsPDF } from "jspdf";

const Dashboard = () => {
    const navigate = useNavigate();
    const [rfiCount, setRfiCount] = useState(0);
	const [showSignModal, setShowSignModal] = useState(false);
	const [loadingSignature, setLoadingSignature] = useState(true);

    const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
    const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
    const userDepartment = localStorage.getItem("departmentFk")?.toLowerCase();
    const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

    const isContractor = userRole === "contractor";
    const isRegularUser = userRole === "regular user";
    const isITAdmin = userRole === "it admin";
    const isDataAdmin = userRole === "data admin";
    const isEngg = userDepartment === "engg";

    const hasFullAccess = isITAdmin || isDataAdmin;

    const navigateWithStatus = (status) => {
        navigate("/CreatedRfi", { state: { filterStatus: status } });
    };

	const generateUniqueTxnId = () => {
	    const timestamp = Date.now();
	    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
	    return `${timestamp}${randomSuffix}`;
	};

	const startCDACSign = async (userId) => {
	    try {
	        const doc = new jsPDF();
	        doc.setFontSize(16);
	        doc.text("User DSC Placeholder PDF", 20, 30);
	        doc.text(`Generated for first-time Aadhaar/DSC signing`, 20, 40);
	        doc.text(`User ID: ${userId}`, 20, 50);
	        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 60);
	        const pdfBlob = doc.output("blob");
			const y = 60 + 20;	

	        const txnId = generateUniqueTxnId();

	        // 2️⃣ Prepare form data with dummy PDF
	        const formData = new FormData();
	        formData.append("pdfBlob", pdfBlob, "dummy.pdf"); // attach dummy PDF
	        formData.append("sc", "Y");
	        formData.append("txnId", txnId);
	        formData.append("signerName", userId);
			formData.append("contractorName", "M V");
			formData.append("signY", Math.floor(y));

	        const signRes = await fetch(`${API_BASE_URL}rfi/getSignedXmlRequestSimple`, {
	            method: "POST",
	            body: formData,
	            credentials: "include",
	        });

	        if (!signRes.ok) throw new Error("Failed to get signed XML");
	        const response = await signRes.json();
			console.log(response);

	        if (!response?.signedXmlRequest || !response?.txnId) {
	            throw new Error("Invalid response from server");
	        }

	        const esignWindow = window.open(
	            "",
	            "esignPortal",
	            "width=800,height=600,resizable=yes,scrollbars=yes"
	        );
	        if (!esignWindow) {
	            alert("⚠️ Please allow pop-ups for this site.");
	            return null;
	        }

	        const form = document.createElement("form");
	        form.method = "POST";
	        form.action = "https://es-staging.cdac.in/esignlevel2/2.1/form/signdoc";
	        form.target = "esignPortal";
	        form.style.display = "none";

	        const signedXmlInput = document.createElement("input");
	        signedXmlInput.type = "hidden";
	        signedXmlInput.name = "eSignRequest";
	        signedXmlInput.value = response.signedXmlRequest;
	        form.appendChild(signedXmlInput);

	        const txnIdInput = document.createElement("input");
	        txnIdInput.type = "hidden";
	        txnIdInput.name = "aspTxnID";
	        txnIdInput.value = response.txnId;
	        form.appendChild(txnIdInput);

	        const contentTypeInput = document.createElement("input");
	        contentTypeInput.type = "hidden";
	        contentTypeInput.name = "Content-Type";
	        contentTypeInput.value = "application/xml";
	        form.appendChild(contentTypeInput);

	        document.body.appendChild(form);
	        form.submit();

	        localStorage.setItem("askForDSC", "false");
	        console.log("Signed XML saved in user folder.");

	    } catch (error) {
	        console.error("CDAC Sign Error:", error);
	        alert("⚠️ eSign failed. Check console for details.");
	        const msgDiv = document.getElementById("redirectMessage");
	        if (msgDiv) document.body.removeChild(msgDiv);
	    }
	};
	
	useEffect(() => {
	    const handleEsignComplete = (event) => {
	        // Only respond to our specific message
	        if (event.data === "esign-completed") {
	            window.location.reload(); // reload parent window
	        }
	    };

	    window.addEventListener("message", handleEsignComplete);

	    return () => {
	        window.removeEventListener("message", handleEsignComplete);
	    };
	}, []);



	useEffect(() => {
	    const userId = localStorage.getItem("userId");

	    fetch(`${API_BASE_URL}api/checkUserSignature?userId=` + userId, {
	        method: "GET",
	        credentials: "include"
	    })
	    .then(res => res.json())
	    .then(data => {
	        if (!data.exists) {
	            setShowSignModal(true); 
	        } else {
	            setShowSignModal(false); 
	        }
	    })
	    .catch(err => console.error("Signature check failed", err))
	    .finally(() => setLoadingSignature(false));
	}, []);

	const handleEsign = () => {
	    const userId = localStorage.getItem("userId");

	    // Now popups will work because it is a USER ACTION  
	    startCDACSign(userId);
	};

    useEffect(() => {
        fetch(`${API_BASE_URL}rfi/rfi-count`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setRfiCount(data))
            .catch((err) => console.error("Failed to fetch RFI count:", err));
    }, []);

    const [statusCounts, setStatusCounts] = useState({
        INSPECTION_DONE: 0,
        PENDING: 0,
        RESCHEDULED: 0,
        INSPECTED_BY_AE: 0,
        APPROVED: 0,
        REJECTED: 0,
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}rfi/status-counts`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setStatusCounts(data))
            .catch((err) => console.error("Failed to fetch RFI status counts:", err));
    }, []);

    const containerRef = useRef(null);

	useEffect(() => {
	    const container = containerRef.current;
	    if (!container) return;  // <<< add this check

	    const items = container.querySelectorAll(".cards");
	    const total = items.length;
	    if (total === 0) return;

	    const perRow = Math.ceil(total / 2);
	    const width = 100 / perRow;

	    items.forEach((item) => {
	        item.style.flex = `1 1 calc(${width}% - 6%)`;
	    });
	}, []);
	
	

	
	if (loadingSignature) {
	    return <div></div>;  // or loader
	}

	if (showSignModal) {
	    return (
	        <div className="modal-overlay">
	            <div className="modal-box">
	                <h2>Digital Signature Required</h2>
	                <p>You must complete eSign (Aadhar OTP) one time to proceed.</p>

	                <button className="esign-btn" onClick={handleEsign}>
	                    Proceed to eSign
	                </button>
	            </div>
	        </div>
	    );
	}

	

		return (
			<div className="dashboard">
				<HeaderRight />
				<div className="right">
					<div className="dashboard-main">
						<div className="home-body">
							<h1>WELCOME TO RFI SYSTEM</h1>
							<div className="body-content">
								<div className="cards-section" ref={containerRef}>
									{/* Card 1: Role-based navigation */}
									<div
										className="cards"
										onClick={() => {
											if (hasFullAccess) {
												navigate("/RfiLog");
											} else if (isContractor || isEngg || isRegularUser) {
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
													 <span className="card-text">RFI Created</span>
											
												</div>
											</div>
										</div>
									</div>


								{/* Card 2: Pending */}
								{!(isEngg  || isDataAdmin) && (
								   <>
								     {/* RFI Scheduled */}
								     <div
								       className="cards"
								       onClick={() =>
								         navigate("/Inspection", { state: { filterStatus: ["CREATED", "UPDATED", "REASSIGNED", "CON_INSP_ONGOING"] } })
								       }
								       style={{ cursor: "pointer" }}
								     >
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
								             <span className="card-text">RFI Scheduled</span>
								           </div>
								         </div>
								       </div>
								     </div>

								     {/* RFI Rescheduled */}
								     <div
								       className="cards"
								       onClick={() =>
								         navigate("/CreatedRfi", { state: { filterStatus: ["RESCHEDULED"] } })
								       }
								       style={{ cursor: "pointer" }}
								     >
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
								             <span className="card-text">RFI Rescheduled</span>
								           </div>
								         </div>
								       </div>
								     </div>
								   </>
								 )}
									
									{/* Card 4: Inspections */}
									<div
										className="cards"
										onClick={() => navigate("/Inspection", { state: { filterStatus: ["INSPECTED_BY_CON"] } })}
										style={{ cursor: 'pointer' }}
									>
										<div className="card-inner">
											<div className="card-top">
												<div className="card-count">
													<span className="card-number">{statusCounts.INSPECTED_BY_CON}</span>
												</div>
												<div className="cards-icon">
													<img src="/images/verify.png" alt="tick symbol" width="25" height="25" />
												</div>
											</div>
											<div className="card-bottom">
												<div className="card-title">
													<span className="card-text">RFI Submitted</span>
												</div>
											</div>
										</div>
									</div>
									
									{/* Card 5: Rescheduled */}
									<div
										className="cards"
										onClick={() => navigate("/Inspection", { state: { filterStatus: ["APPROVED"] } })}
										style={{ cursor: 'pointer' }}
									>
										<div className="card-inner">
											<div className="card-top">
												<div className="card-count">
													<span className="card-number">{statusCounts.APPROVED}</span>
												</div>
												<div className="cards-icon">
													<img src="/images/accepted.png" alt="tick symbol" width="28" height="28" />
												</div>
											</div>
											<div className="card-bottom">
												<div className="card-title">
													<span className="card-text">RFI Approved</span>
												</div>
											</div>
										</div>
									</div>
									
									{/* Card 6: Rescheduled */}
									<div
										className="cards"
										onClick={() => navigate("/Inspection", { state: { filterStatus: ["REJECTED"] } })}
										style={{ cursor: 'pointer' }}
									>
										<div className="card-inner">
											<div className="card-top">
												<div className="card-count">
													<span className="card-number">{statusCounts.REJECTED}</span>
												</div>
												<div className="cards-icon">
													<img src="/images/rejected.png" alt="tick symbol" width="27" height="27" />
												</div>
											</div>
											<div className="card-bottom">
												<div className="card-title">
													<span className="card-text">RFI Rejected</span>
												</div>
											</div>
										</div>
									</div>

									{/* Card : Closed  (Accepted By engg && Inspection_done) */}
									<div
										className="cards"
										onClick={() => navigate("/Inspection", { state: { filterStatus: ["CLOSED"] } })}
										style={{ cursor: 'pointer' }}
									>
										<div className="card-inner">
											<div className="card-top">
												<div className="card-count">
													<span className="card-number">{statusCounts.CLOSED}</span>
												</div>
												<div className="cards-icon">
													<img src="/images/closed.png" alt="tick symbol" width="27" height="27" />
												</div>
											</div>
											<div className="card-bottom">
												<div className="card-title">
													<span className="card-text">RFI Closed</span>
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
	}

	export default Dashboard;
