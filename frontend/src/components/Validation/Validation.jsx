import axios from 'axios';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import autoTable from 'jspdf-autotable';
import './Validation.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const getExtension = (filename) => {
	return filename?.split('.').pop()?.toLowerCase();
};
export default function Validation() {

	const [message, setMessage] = useState('');
	const userRole = localStorage.getItem("userRoleNameFk")?.toLowerCase();
	const userType = localStorage.getItem("userTypeFk")?.toLowerCase();
	const isITAdmin = userRole === 'it admin';
	const isDyHOD = userType === "dyhod";


	const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL?.replace(/\/+$/, '');
	const [editModeList, setEditModeList] = useState([]);

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

	const handleFileChange = (idx, file) => {
		const updated = [...fileList];
		updated[idx] = file;
		setFileList(updated);
	};
	const [submittedList, setSubmittedList] = useState([]);

	const submitValidation = (rfi, idx) => {
		const remarks = remarksList[idx]?.trim();
		const action = statusList[idx]?.trim();
		const file = fileList[idx];

		if (!remarks) {
			alert("Please select a remark before submitting.");
			return;
		}

		if (!action) {
			alert("Please select a status before submitting.");
			return;
		}

		if (!file) {
			alert("Please upload a file before submitting.");
			return;
		}

		const formData = new FormData();
		formData.append("long_rfi_id", rfi.longRfiId);
		formData.append("long_rfi_validate_id", rfi.longRfiValidateId);
		formData.append("remarks", remarks);
		formData.append("action", action);
		formData.append("file", file);

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
				setFileList(prev =>
					prev.map((f, i) => i === idx ? null : f)
				);
			})
			.catch(err => {
				console.error('Validation error:', err);
				alert('Submission failed.');
			});
	};

	const fetchPreview = (rfiId) => {
		axios.get(`${API_BASE_URL}/getRfiReportDetails/${rfiId}`)
			.then(res => {
				if (res.data?.length > 0) {
					setSelectedInspection(res.data[0]);
				}
			})
			.catch(err => console.error(err));
	};


	const getFilename = (path) => path?.split('\\').pop().replace(/^"|"$/g, '');
	const fileBaseURL = `${API_BASE_URL}/previewFiles`;

	const safe = (val) => val || '-';


	const [rfiList, setRfiList] = useState([]);
	const [remarksList, setRemarksList] = useState([]);
	const [statusList, setStatusList] = useState([]);
	const [fileList, setFileList] = useState([]);
	const [selectedInspection, setSelectedInspection] = useState(null);




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

	const generatePDF = async (inspectionList) => {
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
		const safe = (val) => val || '---';
		const logoUrl = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Mrvc_logo.jpg/600px-Mrvc_logo.jpg';
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

			if (logo) doc.addImage(logo, 'JPEG', pageWidth - margin - 45, y, 45, 15);
			y += 18;
			doc.setFontSize(14).setFont(undefined, 'bold');
			doc.text('REQUEST FOR INSPECTION (RFI)', pageWidth / 2, y, { align: 'center' });
			y += 10;
			doc.setFontSize(10).setFont(undefined, 'normal');

			const fields = [
				['Client', inspection.client], ['Consultant', inspection.consultant],
				['Contract', inspection.contract], ['Contractor', inspection.contractor],
				['Contract ID', inspection.contractId], ['RFI ID', inspection.rfiId],
				['Date of Inspection', inspection.dateOfInspection], ['Location', inspection.location],
				['Proposed Time', inspection.proposedInspectionTime], ['Actual Time', inspection.actualInspectionTime],
				['RFI Description', inspection.rfiDescription], ["Contractor's Representative", inspection.contractorRepresentative],
				['Client Representative', inspection.clientRepresentative], ['Description by Contractor', inspection.descriptionByContractor],
				['Enclosures', inspection.enclosures]
			];

			rfiName = inspection.rfiId;

			for (let i = 0; i < fields.length; i += 2) {
				const left = `${fields[i][0]}: ${safe(fields[i][1])}`;
				const right = fields[i + 1] ? `${fields[i + 1][0]}: ${safe(fields[i + 1][1])}` : '';
				const wrappedLeft = doc.splitTextToSize(left, contentWidth / 2 - 5);
				const wrappedRight = doc.splitTextToSize(right, contentWidth / 2 - 5);
				const maxLines = Math.max(wrappedLeft.length, wrappedRight.length);
				for (let j = 0; j < maxLines; j++) {
					const leftText = wrappedLeft[j] || '';
					const rightText = wrappedRight[j] || '';
					doc.text(leftText, margin, y);
					doc.text(rightText, pageWidth / 2 + 5, y);
					y += lineHeight;
					if (y > pageHeight - 20) { doc.addPage(); y = margin; }
				}
			}

			y += 2;
			doc.setFont(undefined, 'bold').text('Checklist - Level Sheet:', margin, y);
			y += 2;
			doc.autoTable({
				startY: y,
				head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
				body: [
					['1', 'Drawing', safe(inspection.drawingStatusLS), safe(inspection.drawingRemarksContracotrLS), safe(inspection.drawingRemarksClientLS)],
					['2', 'Alignment', safe(inspection.alignmentStatusLS), safe(inspection.alignmentoCntractorRemarksLS), safe(inspection.alignmentClientRemarksLS)]
				],
				styles: { fontSize: 9 },
				headStyles: { fillColor: [0, 102, 153], textColor: 255 },
				theme: 'grid',
				didDrawPage: (data) => { y = data.cursor.y + 5; }
			});

			doc.setFont(undefined, 'bold').text('Checklist - Pour Card:', margin, y);
			y += 2;
			doc.autoTable({
				startY: y,
				head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
				body: [
					['1', 'Drawing', safe(inspection.drawingStatusPC), safe(inspection.drawingRemarksContracotrPC), safe(inspection.drawingRemarksClientPC)],
					['2', 'Alignment', safe(inspection.alignmentStatusPC), safe(inspection.alignmentoCntractorRemarksPC), safe(inspection.alignmentClientRemarksPC)]
				],
				styles: { fontSize: 9 },
				headStyles: { fillColor: [0, 102, 153], textColor: 255 },
				theme: 'grid',
				didDrawPage: (data) => { y = data.cursor.y + 5; }
			});

			doc.setFont(undefined, 'bold').text('Status:', margin, y);
			doc.setFont(undefined, 'normal').text(safe(inspection.status), margin + 20, y);
			y += lineHeight;

			doc.setFont(undefined, 'bold').text('Remarks:', margin, y);
			y += 4;
			const remarksText = doc.splitTextToSize(safe(inspection.remarks), contentWidth);
			doc.setFont(undefined, 'normal').text(remarksText, margin, y);
			y += remarksText.length * 5 + 5;

			const imageSection = async (label, paths) => {
				if (!paths || !paths.trim()) return;
				const files = paths.split(',').map(f => f.trim()).filter(Boolean);
				if (!files.length) return;
				doc.setFont(undefined, 'bold').text(`${label}:`, margin, y);
				y += 5;

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
							if (y + imageHeight > pageHeight - 20) {
								doc.addPage();
								y = margin;
							}
							doc.addImage(imgData, 'JPEG', margin, y, imageWidth, imageHeight);
							y += imageHeight + 5;
						} else {
							doc.setDrawColor(0);
							doc.setLineWidth(0.2);
							doc.rect(margin, y, imageWidth, imageHeight);
							doc.text('Image not available', margin + 3, y + 20);
							y += imageHeight + 5;
						}
					}
				}
			};

			const handlePdfOrImage = async (label, filePaths) => {
				if (!filePaths) return;
				const files = filePaths.split(',').map(f => f.trim()).filter(Boolean);
				for (const file of files) {
					if (isPdfFile(file)) {
						const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(file)}`;
						const response = await fetch(fileUrl);
						if (response.ok) {
							const blob = await response.blob();
							externalPdfBlobs.push(blob);
						}
					} else {
						await imageSection(label, file);
					}
				}
			};

			await imageSection('Inspector Selfie', inspection.selfieClient);
			await imageSection('Inspector Site Images', inspection.imagesUploadedByClient);
			await imageSection('Contractor Selfie', inspection.selfieContractor);
			await imageSection('Contractor Site Images', inspection.imagesUploadedByContractor);
			await imageSection('Contractor Enclosures & Test Report', inspection.contractorEnclosureFilePaths);

			await handlePdfOrImage('Level Sheet', inspection.levelSheetFilePath);
			await handlePdfOrImage('Pour Card', inspection.pourCardFilePath);
			await handlePdfOrImage('Test Report Uploaded by Contractor', inspection.testSiteDocumentsContractor);

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
			const res = await axios.get(`${API_BASE_URL}/getRfiReportDetails/${rfiId}`);
			if (res.data?.length > 0) {
				const inspection = res.data[0];
				inspection.remarks = remarksList[idx] || '';
				inspection.status = statusList[idx] || '';
				await generatePDF([inspection]);
			} else {
				alert("No inspection details found.");
			}
		} catch (err) {
			console.error("Error fetching details for PDF:", err);
			alert("Failed to generate PDF. Please try again.");
		}
	};


	const printPreview = () => window.print();


	// pagination variables 


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
					<h2 className="validation-heading">Validation</h2>



					<div className="left-align">
						<label>
							Show{' '}
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setPageIndex(0); // Reset to first page
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
								{isDyHOD || isITAdmin && (
									<th>File</th>
								)}
								{isDyHOD || isITAdmin && (
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
													{isDyHOD || isITAdmin ? (
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
													{isDyHOD || isITAdmin ? (
														<select
															value={status || ""}
															onChange={(e) => updateStatus(globalIndex, e.target.value)}
															disabled={isValidated && !isEditable}
														>
															<option value="">-- Select --</option>
															<option value="APPROVED">Approved</option>
															<option value="REJECTED">Rejected</option>
															<option value="CLARIFICATION_REQUIRED">Clarification Required</option>
														</select>
													) : (
														status ? <span>{status}</span> : <span style={{ color: '#999' }}>Validation Pending</span>
													)}
												</td>

												{/* File input */}
												{(isDyHOD || isITAdmin) && (
													<td>
														<input
															type="file"
															onChange={(e) => handleFileChange(globalIndex, e.target.files[0])}
															disabled={isValidated && !isEditable}
														/>
													</td>
												)}

												{/* Action */}
												{(isDyHOD || isITAdmin) && (
													<td>
														{isValidated ? (
															isEditable ? (
																<button onClick={() => submitValidation(rfi, globalIndex)}>Submit</button>
															) : (
																<button onClick={() => toggleEditMode(globalIndex)}>Edit</button>
															)
														) : (
															<button onClick={() => submitValidation(rfi, globalIndex)}>Validate</button>
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
								<div className="form-row">
									<div className="form-fields" style={{ gridColumn: 'span 1' }}>
										<label>Client:</label>
										<p>Mumbai Rail Vikas Corporation</p>
									</div>
								</div>
								<div className="d-flex justify-center">
									<h3 style={{ gridColumn: 'span 1' }}>Request For Information (RFI)</h3>
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


								</div>

								<h4>Checklist Level Sheet</h4>
								<table className="preview-table">
									<thead>
										<tr>
											<th>ID</th>
											<th>Description</th>
											<th>Status</th>
											<th>Contractor Remarks</th>
											<th>AE Remarks</th>
										</tr>
									</thead>
									<tbody>
										{/* Drawing row */}
										<tr>
											<td>1</td>
											<td>Drawing</td>
											<td>{selectedInspection.drawingStatusLS || '---'}</td>
											<td>{selectedInspection.drawingRemarksContracotrLS || '---'}</td>
											<td>{selectedInspection.drawingRemarksClientLS || '---'}</td>
										</tr>
										{/* Alignment row */}
										<tr>
											<td>2</td>
											<td>Alignment</td>
											<td>{selectedInspection.alignmentStatusLS || '---'}</td>
											<td>{selectedInspection.alignmentoCntractorRemarksLS || '---'}</td>
											<td>{selectedInspection.alignmentClientRemarksLS || '---'}</td>
										</tr>
									</tbody>
								</table>

								<h4>Checklist Pour Card</h4>
								<table className="preview-table">
									<thead>
										<tr>
											<th>ID</th>
											<th>Description</th>
											<th>Status</th>
											<th>Contractor Remarks</th>
											<th>AE Remarks</th>
										</tr>
									</thead>
									<tbody>
										{/* Drawing row */}
										<tr>
											<td>1</td>
											<td>Drawing</td>
											<td>{selectedInspection.drawingStatusPC || '---'}</td>
											<td>{selectedInspection.drawingRemarksContracotrPC || '---'}</td>
											<td>{selectedInspection.drawingRemarksClientPC || '---'}</td>
										</tr>
										{/* Alignment row */}
										<tr>
											<td>2</td>
											<td>Alignment</td>
											<td>{selectedInspection.alignmentStatusPC || '---'}</td>
											<td>{selectedInspection.alignmentoCntractorRemarksPC || '---'}</td>
											<td>{selectedInspection.alignmentClientRemarksPC || '---'}</td>
										</tr>
									</tbody>
								</table>


								<h4>Status & Remarks</h4>
								<p><strong>Status:</strong> {selectedInspection.status || '---'}</p>
								<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>

								{selectedInspection.selfieClient && (
									<div className="image-gallery">
										<h4>Inspector Selfie</h4>
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



								{selectedInspection.levelSheetFilePath && (
									<div className="image-gallery">
										<h4>Enclosures Uploaded (LEVEL SHEET)</h4>
										{selectedInspection.levelSheetFilePath.split(',').map((rawPath, idx) => {
											const path = rawPath.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;
											const extension = getExtension(path); // assuming this returns 'pdf', 'jpg', etc.

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
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
															alt={`Enclosure ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													)}
												</a>
											);
										})}
									</div>
								)}


								{selectedInspection.pourCardFilePath && (
									<div className="image-gallery">
										<h4>Enclosures Uploaded (POUR CARD)</h4>
										{selectedInspection.pourCardFilePath.split(',').map((rawPath, idx) => {
											const path = rawPath.trim();
											const fileUrl = `${fileBaseURL}?filepath=${encodeURIComponent(path)}`;
											const extension = getExtension(path); // assuming this returns 'pdf', 'jpg', etc.

											return (
												<a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer">
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
															alt={`Enclosure ${idx + 1}`}
															className="preview-image"
															onError={() => console.error("Image load error:", fileUrl)}
														/>
													)}
												</a>
											);
										})}
									</div>
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
									<button onClick={printPreview}>Print</button>
									<button onClick={() => generatePDF([selectedInspection])}>Download PDF</button>
								</div>
							</div>
						</div>
					)}

				</div>
			</div>
		</div>
	);
}