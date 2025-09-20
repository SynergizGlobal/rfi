import axios from 'axios';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import autoTable from 'jspdf-autotable';
import "jspdf-autotable";
import './Validation.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const getExtension = (filename) => {
	return filename?.split('.').pop()?.toLowerCase();
};
export default function Validation() {
	const [selectedInspection, setSelectedInspection] = useState(null);


	const [message, setMessage] = useState('');
	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
	const isITAdmin = userRole === 'it admin';
	const isDyHOD = userType === "dyhod";


	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL?.replace(/\/+$/, '');
	const [editModeList, setEditModeList] = useState([]);
	const [comments, setComments] = useState({});
	const handleCommentChange = (rowIndex, value) => {
		if (value.length <= 500) {
			setComments((prev) => ({
				...prev,
				[rowIndex]: value,
			}));
		}
	};
	const [checklistItems, setChecklistItems] = useState([]);
	const [enclosures, setEnclosures] = useState([]);
		const [Measurement,setMeasurement ] = useState([]);




	useEffect(() => {
		axios.get(`${API_BASE_URL}/getRfiValidations`, { withCredentials: true })
			.then(res => {
				console.log("GET /getRfiValidations response:", res.data);

				const data = Array.isArray(res.data) ? res.data : [];

				setRfiList(data);
				setRemarksList(data.map(item => item.remarks || ""));
				setStatusList(data.map(item => item.status || ""));
				setEditModeList(data.map(() => false));
				setSubmittedList(data.map(item => item.remarks && item.status ? true : false));

				if (data.length === 0) {
					setMessage('No RFI validations found.');
				} else {
					setMessage('');
				}
			})
			.catch(err => {
				console.error("Error fetching RFI validations:", err);
				setRfiList([]);
				setRemarksList([]);
				setStatusList([]);
				setEditModeList([]);
				setSubmittedList([]);
				setMessage('Error loading RFI validations.');
			});
	}, []);




	const updateRemark = (idx, value) => {
		setRemarksList(prev => prev.map((item, i) => i === idx ? value : item));
	};

	const updateStatus = (idx, value) => {
		setStatusList(prev => prev.map((item, i) => i === idx ? value : item));
	};

	const toggleEditMode = (idx) => {
		setEditModeList(prev =>
			prev.map((item, i) => i === idx ? !item : item)
		);
	};

	const [submittedList, setSubmittedList] = useState([]);

	const submitValidation = (rfi, idx) => {
		const remarks = remarksList[idx]?.trim();
		const action = statusList[idx]?.trim();
		const comment = comments[idx]?.trim();
		 if (!remarks) {
			alert("Please select a remark before submitting.");
			return;
		}

		if (!action) {
			alert("Please select a status before submitting.");
			return;
		}

		if (!comment) {
			alert("Please upload a file before submitting.");
			return;
		}

		const formData = new FormData();
		formData.append("long_rfi_id", rfi.longRfiId);
		formData.append("long_rfi_validate_id", rfi.longRfiValidateId);
		formData.append("remarks", remarks);
		formData.append("action", action);
		formData.append("comment", comment);

		axios.post(`${API_BASE_URL}/validate`, formData)
			.then(() => {
				alert('Validation submitted successfully.');
				setRfiList(prevList => {
					const updated = [...prevList];
					updated[idx] = {
						...updated[idx],
						remarks,
						action
					};
					return updated;
				});
				setSubmittedList(prev =>
					prev.map((item, i) => i === idx ? true : item)
				);
				setEditModeList(prev =>
					prev.map((item, i) => i === idx ? false : item)
				);

			})
			.catch(err => {
				console.error('Validation error:', err);
				alert('Submission failed.');
			});
	};


	const fetchPreview = (rfiId) => {
		axios.get(`${API_BASE_URL}/getRfiReportDetail/${rfiId}`)
			.then((res) => {
				const data = res.data;
				setSelectedInspection(data.reportDetails);
				setChecklistItems(data.checklistItems);
				setEnclosures(data.enclosures);
				setMeasurement(data.measurementDetails);
			})
			.catch((err) => console.error(err));
	};

	const handleDownload = () => {
		if (selectedInspection ) {
			generatePDF([selectedInspection], checklistItems, enclosures,Measurement);
		} else {
			alert("⚠️ No data available to generate PDF!");
		}
	};


	const getFilename = (path) => path?.split('\\').pop().replace(/^"|"$/g, '');
	const fileBaseURL = `${API_BASE_URL}/previewFiles`;

	const safe = (val) => val || '-';


	const [rfiList, setRfiList] = useState([]);
	const [remarksList, setRemarksList] = useState([]);
	const [statusList, setStatusList] = useState([]);
	const [comment, setComment] = useState([]);




	const toBase64 = async (url) => {
		const response = await fetch(url);
		const blob = await response.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		});
	};

	const isPdfFile = (file) => {
		return typeof file === 'string' && file.toLowerCase().endsWith('.pdf');
	};

	const externalPdfBlobs = [];

	async function mergeWithExternalPdfs(jsPDFDoc) {
		const mainPdfBytes = jsPDFDoc.output('arraybuffer');
		const mainPdf = await PDFDocument.load(mainPdfBytes);

		for (const fileBlob of externalPdfBlobs) {
			const externalPDF = await PDFDocument.load(await fileBlob.arrayBuffer());
			const pages = await mainPdf.copyPages(externalPDF, externalPDF.getPageIndices());
			pages.forEach((page) => mainPdf.addPage(page));
		}

		const mergedPdfBytes = await mainPdf.save();
		return new Blob([mergedPdfBytes], { type: 'application/pdf' });
	}

	const generatePDF = async (inspectionList, checklistItems, enclosures, measurements) => {
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
		const safe = (val) => val || '---';
		const logoUrl = 'https://www.manabadi.com/wp-content/uploads/2016/11/4649MRVC.jpg';
		const logo = await toBase64(logoUrl);
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 10;
		const contentWidth = pageWidth - 2 * margin;
		const imageWidth = 60;
		const imageHeight = 40;
		const lineHeight = 6;

		let rfiName = null;


		for (let idx = 0; idx < inspectionList.length; idx++) {
			const inspection = inspectionList[idx];
			rfiName = inspection.rfiId;

			if (idx !== 0) doc.addPage();
			let y = margin;
			doc.setFontSize(14).setFont(undefined, 'bold');
			doc.text('Mumbai Rail Vikas Corporation', pageWidth / 2, y, { align: 'center' });
			if (logo) doc.addImage(logo, 'JPEG', pageWidth - margin - 45, y, 45, 15);
			y += 18;
			doc.setFontSize(14).setFont(undefined, 'bold');
			doc.text('REQUEST FOR INSPECTION (RFI) REPORT', pageWidth / 2, y, { align: 'center' });
			y += 10;
			doc.setFontSize(10).setFont(undefined, 'normal');



			const bottomMargin = 20;

			const ensureSpace = (neededHeight) => {
				if (y + neededHeight > pageHeight - bottomMargin) {
					doc.addPage();
					y = margin;
				}
			};



			const fields = [
				['Consultant', inspection.consultant],
				['Contract', inspection.contract], ['Contractor', inspection.contractor],
				['Contract ID', inspection.contractId], ['RFI ID', inspection.rfiId],
				['Date of Inspection', inspection.dateOfInspection], ['Location', inspection.location],
				['Proposed Time', inspection.proposedInspectionTime], ['Actual Time', inspection.actualInspectionTime],
				['RFI Description', inspection.rfiDescription], ["Contractor's Representative", inspection.contractorRepresentative],
				['Client Representative', inspection.clientRepresentative], ['Description by Contractor', inspection.descriptionByContractor],
				['Enclosures', inspection.enclosures]
			];
			doc.autoTable({
			  startY: y,
			  body: fields,
			  styles: { fontSize: 9 },
			  theme: "plain",
			  columnStyles: { 0: { fontStyle: "bold" } }
			});
			y = doc.lastAutoTable.finalY || (y + 20);
			ensureSpace(lineHeight);

			if (measurements && (Array.isArray(measurements) ? measurements.length > 0 : true)) {
			  const measurementArray = Array.isArray(measurements) ? measurements : [measurements];

			  y += 10;
			  doc.setFont(undefined, "bold").setFontSize(12);
			  doc.text("Measurement Details", pageWidth / 2, y, { align: "center" });

			  doc.autoTable({
			    startY: y + 5,
			    head: [["Type", "Length", "Breadth", "Height", "Count", "Total Quantity"]],
			    body: measurementArray.map((m) => [
			      safe(m.measurementType),
			      safe(m.l),
			      safe(m.b),
			      safe(m.h),
			      safe(m.no),
			      safe(m.totalQty),
			    ]),
			    styles: { fontSize: 9 },
			    headStyles: { fillColor: [0, 102, 153], textColor: 255 },
			    theme: "grid",
			  });
			  y = doc.lastAutoTable.finalY || (y + 20);
			  ensureSpace(lineHeight);
			}
			rfiName = inspection.rfiId;
			ensureSpace(lineHeight);
			if (checklistItems && checklistItems.length > 0) {
				const grouped = checklistItems.reduce((groups, item) => {
					if (!groups[item.enclosureName]) groups[item.enclosureName] = [];
					groups[item.enclosureName].push(item);
					return groups;
				}, {});
				ensureSpace(lineHeight);
				for (const [enclosureName, items] of Object.entries(grouped)) {
					y += 10;
					doc.setFont(undefined, "bold").setFontSize(12);
					doc.text(`${enclosureName}`, pageWidth / 2, y, { align: "center" });
					ensureSpace(lineHeight);
					doc.autoTable({
						startY: y + 5,
						head: [["#", "Description", "Contractor Status", "AE Status", "Contractor Remarks", "AE Remarks"]],
						body: items.map((row, i) => [
							i + 1,
							safe(row.checklistDescription),
							safe(row.conStatus),
							safe(row.aeStatus),
							safe(row.contractorRemark),
							safe(row.aeRemark),
						]),
						styles: { fontSize: 9 },
						headStyles: { fillColor: [0, 102, 153], textColor: 255 },
						theme: "grid"
					});

					y = doc.lastAutoTable.finalY || (y + 20);
				}
				ensureSpace(lineHeight);
			}

			y += 15;
			ensureSpace(lineHeight);
			
			doc.setFont(undefined, "bold").setFontSize(11).text("Validation Status & Remarks:", margin, y);
			y += lineHeight;
			doc.setFont(undefined, "bold").setFontSize(11).text("Status:", margin + 10, y);
			doc.setFont(undefined, "normal").setFontSize(11).text(safe(inspection.validationStatus), margin + 30, y);
			y += lineHeight;
			doc.setFont(undefined, "bold").setFontSize(11).text("Remarks:", margin + 10, y);
			doc.setFont(undefined, "normal").setFontSize(11).text(safe(inspection.remarks), margin + 30, y);
			y += 15;
			ensureSpace(lineHeight);
			const imageSection = async (label, paths, x = margin, yPos = y, options = {}) => {
			    if (!paths || !paths.trim()) return;
			    const files = paths.split(',').map(f => f.trim()).filter(Boolean);
			    if (!files.length) return;

			    const align = options.align || "left";

			    if (align === "center") {
			        doc.setFont(undefined, 'bold');
			        const textWidth = doc.getTextWidth(`${label}:`);
			        const centerX = (pageWidth - textWidth) / 2;
			        doc.text(`${label}:`, centerX, yPos);
			    } else {
			        doc.setFont(undefined, 'bold').text(`${label}:`, margin, yPos);
			    }
			    yPos += 5;

			    for (const file of files) {
			        const extension = file.split('.').pop().toLowerCase();
			        const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;

			        if (extension === 'pdf') {
			            const response = await fetch(fileUrl);
			            if (response.ok) {
			                const blob = await response.blob();
			                externalPdfBlobs.push(blob);
			            }
			        } else {
			            const imgData = await toBase64(fileUrl);
			            if (imgData) {
			                if (yPos + imageHeight > pageHeight - 20) {
			                    doc.addPage();
			                    yPos = margin;
			                }

			                let imgX = margin;
			                if (align === "center") {
			                    imgX = (pageWidth - imageWidth) / 2;
			                }

			                doc.addImage(imgData, 'JPEG', imgX, yPos, imageWidth, imageHeight);
			                yPos += imageHeight + 5;
			            } else {
			                doc.setDrawColor(0);
			                doc.setLineWidth(0.2);

			                let rectX = margin;
			                if (align === "center") {
			                    rectX = (pageWidth - imageWidth) / 2;
			                }

			                doc.rect(rectX, yPos, imageWidth, imageHeight);
			                doc.text('Image not available', rectX + 3, yPos + 20);
			                yPos += imageHeight + 5;
			            }
			        }
			    }
			    y = yPos;
			};

			ensureSpace(lineHeight);

			const handlePdfOrImage = async (label, filePaths) => {
				if (!filePaths) return;

				const files = filePaths.split(',').map(f => f.trim()).filter(Boolean);
				if (!files.length) return;
				ensureSpace(lineHeight);
			//	doc.setFont(undefined, 'bold').text(`${label}:`, margin, y);
				y += 5;

				for (const file of files) {
					const extension = file.split('.').pop().toLowerCase();
					const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;

					if (extension === "pdf") {
						const response = await fetch(fileUrl);
						if (response.ok) {
							const blob = await response.blob();
							externalPdfBlobs.push(blob);
						}
					} else {
						const imgData = await toBase64(fileUrl);
						if (imgData) {
							if (y + imageHeight > pageHeight - 20) {
								doc.addPage();
								y = margin;
							}
							ensureSpace(lineHeight);
							doc.addImage(imgData, "JPEG", margin, y, imageWidth, imageHeight);
							y += imageHeight + 5;
						}
					}
				}
			};

			ensureSpace(lineHeight);
			await imageSection('Inspector Selfie', inspection.selfieClient, margin, y, { align: "center" });
			y += 10;

			ensureSpace(lineHeight);
			await imageSection('Inspector Site Images', inspection.imagesUploadedByClient, margin, y, { align: "center" });
			y += 15;

			ensureSpace(lineHeight);
			await imageSection('Contractor Selfie', inspection.selfieContractor, margin, y, { align: "center" });
			y += 10;

			ensureSpace(lineHeight);
			await imageSection('Contractor Site Images', inspection.imagesUploadedByContractor, margin, y, { align: "center" });
			y += 15;

			ensureSpace(lineHeight);
			if (enclosures && enclosures.length > 0) {
				for (const enc of enclosures) {
					await handlePdfOrImage(enc.enclosureName, enc.file);
				}
			}
			ensureSpace(lineHeight);
			await handlePdfOrImage('Test Report',inspection.testSiteDocumentsContractor);

		}

		const mergedBlob = await mergeWithExternalPdfs(doc);
		const link = document.createElement('a');
		link.href = URL.createObjectURL(mergedBlob);
		if (rfiName) {
			link.download = `${rfiName}_RfiReport.pdf`;
		}
		link.click();
	};

	const downloadPDFWithDetails = async (rfiId, idx) => {
		try {
			const res = await axios.get(`${API_BASE_URL}/getRfiReportDetail/${rfiId}`);

			if (res.data?.reportDetails) {
				const inspection = res.data.reportDetails;

				inspection.remarks = remarksList[idx] || '';
				inspection.status = statusList[idx] || '';

				await generatePDF(
				  [inspection],
				  res.data.checklistItems || [],
				  res.data.enclosures || [],
				  res.data.measurementDetails ? [res.data.measurementDetails] : []
				);

			} else {
				alert("No inspection details found.");
			}
		} catch (err) {
			console.error("Error fetching details for PDF:", err);
			alert("Failed to generate PDF. Please try again.");
		}
	};



	const handlePrint = () => {
		window.print();
	};

	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(5);

	const totalEntries = rfiList.length;
	const pageCount = Math.ceil(totalEntries / pageSize);

	const currentData = rfiList.slice(
		pageIndex * pageSize,
		(pageIndex + 1) * pageSize
	);





	return (
		<div className="dashboard validation">

			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<h2 className="validation-heading">RFI VALIDATION</h2>



					<div className="left-align">
						<label>
							Show{' '}
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setPageIndex(0); 
								}}
							>
								{[5, 10, 20, 50].map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>{' '}
							entries
						</label>
					</div>


					<table className="validation-table">
						<thead>
							<tr>
								<th>RFI ID</th>
								<th>Preview</th>
								<th>Download</th>
								<th>Remarks</th>
								<th>Status</th>
								{(isDyHOD || isITAdmin) && (
									<th>Comments</th>
								)}
								{(isDyHOD || isITAdmin) && (
									<th>Action</th>
								)}
							</tr>
						</thead>
						<tbody>
							{rfiList.length > 0 ? (
								rfiList
									.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) // 👈 only take current page
									.map((rfi, idx) => {
										const globalIndex = pageIndex * pageSize + idx; // 👈 actual index in full list
										const remarks = remarksList[globalIndex];
										const status = statusList[globalIndex];
										const isValidated = submittedList[globalIndex];
										const isEditable = editModeList[globalIndex];

										return (
											<tr key={globalIndex}>
												<td>{rfi.stringRfiId}</td>

												<td>
													<button onClick={() => fetchPreview(rfi.longRfiId)}>👁️</button>
												</td>

												<td>
													<button onClick={() => downloadPDFWithDetails(rfi.longRfiId, globalIndex)}>⬇️</button>
												</td>
												{/* Remarks column */}
												<td>
													{(isDyHOD || isITAdmin) ? (
														<select
															value={remarks || ""}
															onChange={(e) => updateRemark(globalIndex, e.target.value)}
															disabled={isValidated && !isEditable}
														>
															<option value="">-- Select --</option>
															<option value="NONO">NONO</option>
															<option value="NONOC(B)">NONOC (B)</option>
															<option value="NONOC(C)">NONOC (C)</option>
															<option value="NOR">NOR</option>
														</select>
													) : (
														remarks ? <span>{remarks}</span> : <span style={{ color: '#999' }}>Validation Pending</span>
													)}
												</td>


												{/* Status column */}
												<td>
													{(isDyHOD || isITAdmin) ? (
														<select
															value={status || ""}
															onChange={(e) => updateStatus(globalIndex, e.target.value)}
															disabled={isValidated && !isEditable}
														>
															<option value="">-- Select --</option>
															<option value="APPROVED">Approved</option>
															<option value="REJECTED">Rejected</option>
														</select>
													) : (
														status ? <span>{status}</span> : <span style={{ color: '#999' }}>Validation Pending</span>
													)}
												</td>


												{(isDyHOD || isITAdmin) && (<td style={{ position: "relative" }}>
													<textarea
														value={comments[globalIndex] || ""}
														onChange={(e) => handleCommentChange(globalIndex, e.target.value)}
														disabled={isValidated && !isEditable}
														placeholder="Enter your comment"
														style={{
															width: "100%",
															minHeight: "60px",
															resize: "vertical",
															padding: "8px",
															borderRadius: "6px",
															border: "1px solid #ccc",
															fontSize: "14px",
															boxSizing: "border-box"
														}}
													/>
													{/* Character counter inside bottom-right */}
													<div
														style={{
															position: "absolute",
															bottom: "1px",
															right: "10px",
															fontSize: "12px",
															color: (comments[globalIndex]?.length || 0) >= 500 ? "red" : "#888",
															pointerEvents: "none",
															backgroundColor: "#fff"
														}}
													>
														{500 - (comments[globalIndex]?.length || 0)} / 500
													</div>
												</td>)}



												{/* Action */}
												{(isDyHOD || isITAdmin) && (
													<td>
														{isValidated ? (
															isEditable ? (
																<button className='btn btn-primary' onClick={() => submitValidation(rfi, globalIndex)}>Submit</button>
															) : (
																<button className='btn btn-secondary' onClick={() => toggleEditMode(globalIndex)}>Edit</button>
															)
														) : (
															<button className='btn btn-primary' onClick={() => submitValidation(rfi, globalIndex)}>Validate</button>
														)}
													</td>
												)}
											</tr>
										);
									})
							) : (
								<tr>
									<td colSpan="7">
										{message && (
											<div className="alert alert-info" role="alert">
												{message}
											</div>
										)}
									</td>
								</tr>
							)}
						</tbody>


					</table>





					<div className="">
						<div >
							<span>
								Showing {rfiList.length === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
								{Math.min((pageIndex + 1) * pageSize, rfiList.length)} of {rfiList.length} entries
							</span>

							<button
								onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
								disabled={pageIndex === 0}
							>
								&laquo;
							</button>
							<span style={{ margin: '0 10px' }}>
								Page {pageIndex + 1} of {pageCount}
							</span>
							<button
								onClick={() => setPageIndex((prev) => Math.min(prev + 1, pageCount - 1))}
								disabled={pageIndex >= pageCount - 1}
							>
								&raquo;
							</button>
						</div>
					</div>


					{selectedInspection && (
						<div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
							<div className="popup-content" onClick={(e) => e.stopPropagation()}>
								<h3>RFI Preview</h3>
								<div className="form-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
									<div className="form-fields">
										<label>Client:</label>
										<p>Mumbai Rail Vikas Corporation</p>
									</div>
									<div style={{ textAlign: 'right' }}>
										<label style={{ color: '#636363' }}>RFI Status:</label>
										<p style={{
											color: selectedInspection.rfiStatus === "INSPECTION_DONE" ? "red" : "green",
											fontWeight: "bold",
										}}
										>{selectedInspection.rfiStatus === "INSPECTION_DONE" ? "Closed" : "Active"}</p>
									</div>
								</div>

								<div className="d-flex justify-center">
									<h3 style={{ gridColumn: 'span 1' }}>Request For Inspection (RFI)</h3>
								</div>
								<div className="form-row align-start">
									<div className="form-fields">
										<label>Consultant:</label>
										<p>{selectedInspection.consultant}</p>
									</div>

									<div className="form-fields">
										<label>Contract:</label>
										<p>{selectedInspection.contract}</p>
									</div>

									<div className="form-fields">
										<label>Contractor:</label>
										<p>{selectedInspection.contractor}</p>
									</div>

									<div className="form-fields">
										<label>Contract ID:</label>
										<p>{selectedInspection.contractId}</p>
									</div>

									<div className="form-fields">
										<label>RFI ID:</label>
										<p>{selectedInspection.rfiId}</p>
									</div>

									<div className="form-fields">
										<label>Date of Inspection:</label>
										<p>{selectedInspection.dateOfInspection}</p>
									</div>
									<div className="form-fields">
										<label>Location:</label>
										<p>{selectedInspection.location}</p>
									</div>

									<div className="form-fields">
										<label>Proposed Time:</label>
										<p>{selectedInspection.proposedInspectionTime}</p>
									</div>

									<div className="form-fields">
										<label>Actual Time:</label>
										<p>{selectedInspection.actualInspectionTime}</p>
									</div>
									<div className="form-fields">
										<label>RfiDescription:</label>
										<p>{selectedInspection.rfiDescription}</p>
									</div>

									<div className="form-fields">
										<label>Enclosures:</label>
										<p>{selectedInspection.enclosures}</p>
									</div>


									<div className="form-fields">
										<label>Contractor's Representative:</label>
										<p>{selectedInspection.contractorRepresentative}</p>
									</div>

									<div className="form-fields">
										<label>Client Representative:</label>
										<p>{selectedInspection.clientRepresentative}</p>
									</div>

									<div className="form-fields">
										<label>Description by Contractor:</label>
										<p>{selectedInspection.descriptionByContractor}</p>
									</div>

									<div className="form-fields">
										<label>Test Report Approval By Inspector:</label>
										<p>{selectedInspection.testStatus}</p>
									</div>


								</div >
								
								{Measurement && (<div className='previewTable-section'>
									<h3> Measurement Details</h3>
									<div className='measurements-table-prev'>
										<table>
											<thead>
											<tr>
											<th>Type</th>
											<th>Length</th>
											<th>Breadth</th>
											<th>Height</th>
											<th>Count</th>
											<th>Total Quantity</th>
											</tr>
											</thead>
											<tbody>
												<tr>
													<td>{Measurement.measurementType}</td>
													<td>{Measurement.l}</td>
													<td>{Measurement.b}</td>
													<td>{Measurement.h}</td>
													<td>{Measurement.no	}</td>
													<td>{Measurement.totalQty}</td>
												</tr>
											</tbody>

										</table>

									</div>
								</div>)
								}

								{checklistItems && checklistItems.length > 0 ? (
									Object.entries(
										checklistItems.reduce((groups, item) => {
											if (!groups[item.enclosureName]) {
												groups[item.enclosureName] = [];
											}
											groups[item.enclosureName].push(item);
											return groups;
										}, {})
									).map(([enclosureName, items], idx) => (
										<div key={idx} className="previewTable-section">
											<h3 >{enclosureName}</h3>
											<table className="measurements-table-prev">
												<thead>
													<tr>
														<th>ID</th>
														<th>Description</th>
														<th>Contractor Status</th>
														<th>AE Status</th>
														<th>Contractor Remarks</th>
														<th>AE Remarks</th>
													</tr>
												</thead>
												<tbody>
													{items.map((row, i) => (
														<tr key={i}>
															<td>{i + 1}</td>
															<td>{row.checklistDescription || "---"}</td>
															<td>{row.conStatus || "---"}</td>
															<td>{row.aeStatus || "---"}</td>
															<td>{row.contractorRemark || "---"}</td>
															<td>{row.aeRemark || "---"}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									))
								) : (
									<p>No checklist items found.</p>
								)}



								<div className='previewTable-section'>
								<h3>Validation Status & Remarks</h3>
								<p><strong> Status:</strong> {selectedInspection.validationStatus || '---'}</p>
								<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>

								</div>
								{selectedInspection.selfieClient && (
									<div className="image-gallery">
										<h4 style={{ textAlign: 'center' }}>Inspector Selfie</h4>
										{selectedInspection.selfieClient.split(',').map((img, idx) => {
											const trimmedPath = img.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
													<img
														src={fileUrl}
														alt={`Contractor Image ${idx + 1}`}
														className="preview-image"
														onError={() => console.error("Image load error:", fileUrl)}
													/>
												</a>
											);
										})}
									</div>
								)}


								{selectedInspection.imagesUploadedByClient && (
									<div className="image-gallery">
										<h4>Site Images By Inspector</h4>
										{selectedInspection.imagesUploadedByClient.split(',').map((img, idx) => {
											const trimmedPath = img.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
													<img
														src={fileUrl}
														alt={`Contractor Image ${idx + 1}`}
														className="preview-image"
														onError={() => console.error("Image load error:", fileUrl)}
													/>
												</a>
											);
										})}
									</div>
								)}

								{selectedInspection.selfieContractor && (
									<div className="image-gallery">
										<h4>Contractor Selfie</h4>
										{selectedInspection.selfieContractor.split(',').map((img, idx) => {
											const trimmedPath = img.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
													<img
														src={fileUrl}
														alt={`Contractor Image ${idx + 1}`}
														className="preview-image"
														onError={() => console.error("Image load error:", fileUrl)}
													/>
												</a>
											);
										})}
									</div>
								)}


								{selectedInspection.imagesUploadedByContractor && (
									<div className="image-gallery">
										<h4>Site Images By Contractor</h4>
										{selectedInspection.imagesUploadedByContractor.split(',').map((img, idx) => {
											const trimmedPath = img.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(trimmedPath)}`;

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
													<img
														src={fileUrl}
														alt={`Contractor Image ${idx + 1}`}
														className="preview-image"
														onError={() => console.error("Image load error:", fileUrl)}
													/>
												</a>
											);
										})}
									</div>
								)}



								{enclosures && enclosures.length > 0 ? (
																	Object.entries(
																		enclosures.reduce((groups, item) => {
																			if (!groups[item.enclosureName]) {
																				groups[item.enclosureName] = [];
																			}
																			groups[item.enclosureName].push(item.file);
																			return groups;
																		}, {})
																	).map(([enclosureName, files], idx) => (
																		<div key={idx} className="image-gallery">
																			<h4>Enclosures Uploaded ({enclosureName})</h4>
																			{files.map((rawPath, i) => {
																				const path = rawPath.trim();
																				const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;
																				const extension = getExtension(path);

																				return (
																					<a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer">
																						{extension === "pdf" ? (
																							<embed
																								src={fileUrl}
																								type="application/pdf"
																								width="100%"
																								height="500px"
																								className="preview-pdf"
																							/>
																						) : (
																							<img
																								src={fileUrl}
																								alt={`Enclosure ${i + 1}`}
																								className="preview-image"
																								onError={() => console.error("Image load error:", fileUrl)}
																							/>
																						)}
																					</a>
																				);
																			})}
																		</div>
																	))
																) : (
																	<p>No enclosures uploaded.</p>
																)}




								{selectedInspection.testSiteDocumentsContractor && (
									<div className="image-gallery">
										<h4>Test Report Uploaded By Contractor</h4>

										{(() => {
											const path = selectedInspection.testSiteDocumentsContractor.trim();
											const filename = getFilename(path);
											const extension = getExtension(filename);
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;

											return (
												<a href={fileUrl} target="_blank" rel="noopener noreferrer">
													{extension === 'pdf' ? (
														<embed
															src={fileUrl}
															type="application/pdf"
															width="100%"
															height="500px"
															className="preview-pdf"
														/>
													) : (
														<img
															src={fileUrl}
															alt="Test Report"
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													)}
												</a>
											);
										})()}
									</div>
								)}


								<div className="popup-actions">
									<button onClick={() => setSelectedInspection(null)}>Close</button>
									<button onClick={handlePrint}>Print</button>
									<button onClick={handleDownload}>Download PDF</button>
								</div>
							</div>
						</div>
					)}

				</div>
			</div>
		</div>
	);
	}