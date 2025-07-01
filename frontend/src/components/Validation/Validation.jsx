import axios from 'axios';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Validation.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const getExtension = (filename) => {
	return filename?.split('.').pop()?.toLowerCase();
};
export default function Validation() {
	const [rfiList, setRfiList] = useState([]);
	const [remarksList, setRemarksList] = useState([]);
	const [statusList, setStatusList] = useState([]);
	const [fileList, setFileList] = useState([]);
	const [selectedInspection, setSelectedInspection] = useState(null);

	useEffect(() => {
		axios.get('http://localhost:8000/getRfiValidations')
			.then(res => setRfiList(res.data))
			.catch(err => console.error(err));
	}, []);

	const updateRemark = (idx, value) => {
		const updated = [...remarksList];
		updated[idx] = value;
		setRemarksList(updated);
	};

	const updateStatus = (idx, value) => {
		const updated = [...statusList];
		updated[idx] = value;
		setStatusList(updated);
	};

	const handleFileChange = (idx, file) => {
		const updated = [...fileList];
		updated[idx] = file;
		setFileList(updated);
	};

	const submitValidation = (rfi, idx) => {
		const formData = new FormData();
		formData.append("long_rfi_id", rfi.longRfiId);
		formData.append("long_rfi_validate_id", rfi.longRfiValidateId);
		formData.append("remarks", remarksList[idx] || '');
		formData.append("action", statusList[idx] || '');
		formData.append("file", fileList[idx]);

		axios.post("http://localhost:8000/validate", formData)
			.then(() => alert('Validation submitted successfully.'))
			.catch(err => console.error('Validation error:', err));
	};

	const fetchPreview = (rfiId) => {
		axios.get(`http://localhost:8000/getRfiReportDetails/${rfiId}`)
			.then(res => {
				if (res.data?.length > 0) {
					setSelectedInspection(res.data[0]);
				}
			})
			.catch(err => console.error(err));
	};


	const getFilename = (path) => path?.split('\\').pop().replace(/^"|"$/g, '');
	const fileBaseURL = 'http://localhost:8000/previewFiles';

	const toBase64 = (url) => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.crossOrigin = 'Anonymous';
				img.src = url;
				img.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0);
					resolve(canvas.toDataURL('image/jpeg'));
				};
				img.onerror = reject;
			});
			};

	

	const generatePDF = async (inspectionListToExport, remarksList = [], statusList = []) => {
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

		const addImageSafely = (imgData, x = 15, yPos, width = 60, height = 40) => {
			try {
				if (yPos + height > 280) {
					doc.addPage();
					yPos = 30;
				}
				doc.addImage(imgData, 'JPEG', x, yPos, width, height);
				return yPos + height + 5;
			} catch (e) {
				console.warn("Image load error:", e);
				return yPos;
			}
		};

		


		const loadLogo = () =>
			new Promise(resolve => {
				const img = new Image();
				img.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Mrvc_logo.jpg/600px-Mrvc_logo.jpg';
				img.onload = () => resolve(img);
				img.onerror = () => resolve(null);
			});

		const logo = await loadLogo();

		inspectionListToExport.forEach((inspection, idx) => {
			// ✅ Inject live remarks and status
			if (remarksList[idx]) inspection.remarks = remarksList[idx];
			if (statusList[idx]) inspection.rfiStatus = statusList[idx];

			if (idx !== 0) doc.addPage();
			if (logo) doc.addImage(logo, 'JPEG', 150, 10, 40, 15);

			let y = 30;
			const safe = (val) => val || '---';

			doc.setFontSize(10);
		const wrappedclient = doc.splitTextToSize(`Client: ${safe(inspection.client)}`, 15);
		doc.text(wrappedclient, 10, y);
		y += wrappedclient.length * 5;
		
		doc.setFontSize(12);
		doc.text('REQUEST FOR INSPECTION (RFI)', 70, y);
		y += 8;

		doc.setFontSize(10);
		const wrappedconsultant = doc.splitTextToSize(`Consultant: ${safe(inspection.consultant)}`, 30);
		doc.text(wrappedconsultant, 10, y);

		const wrappedContract = doc.splitTextToSize(`Contract: ${safe(inspection.contract)}`, 120);
		doc.text(wrappedContract, 75, y);

		y += 12;

		const wrappedContractor = doc.splitTextToSize(`Contractor: ${safe(inspection.contractor)}`, 30);
		doc.text(wrappedContractor, 10, y);
		
		const wrappedContractId = doc.splitTextToSize(`Contract ID: ${safe(inspection.contractId)}`, 120);
		doc.text(wrappedContractId, 75, y);

		y += 12;

		
		const wrappedrfiId = doc.splitTextToSize(`RFI ID: ${safe(inspection.rfiId)}`, 80);
		doc.text(wrappedrfiId, 10, y);
		y += wrappedrfiId.length * 5;
			
			doc.text(`Date of Inspection: ${safe(inspection.dateOfInspection)}`, 10, y);
			doc.text(`Location: ${safe(inspection.location)}`, 75, y);
			doc.text(`Proposed Time: ${safe(inspection.proposedInspectionTime)}`, 135, y);
			y += 8;
			doc.text(`Actual Time: ${safe(inspection.actualTime)}`, 10, y);
			y += 8;
			doc.text(`Contractor’s Representative: ${safe(inspection.contractorRep)}`, 10, y);
			doc.text(`Client Representative: ${safe(inspection.clientRep)}`, 105, y);
			y += 10;

			doc.setFont(undefined, 'bold');
			doc.text('Description by Contractor:', 10, y);
			doc.setFont(undefined, 'normal');
			y += 8;
			const contractorDesc = doc.splitTextToSize(safe(inspection.contractorDescription), 180);
			doc.text(contractorDesc, 10, y);
			y += contractorDesc.length * 5;

			doc.setFont(undefined, 'bold');
			doc.text('Comments by Client:', 10, y);
			doc.setFont(undefined, 'normal');
			y += 8;
			const clientComments = doc.splitTextToSize(safe(inspection.clientComments), 180);
			doc.text(clientComments, 10, y);
			y += clientComments.length * 5;

			doc.setFont(undefined, 'bold');
			doc.text('RFI Approval Status:', 10, y);
			y += 8;

			const statusOptions = ['Approved', 'Rejected', 'Approved with Comments'];
			statusOptions.forEach((opt, i) => {
				const x = 15 + i * 60;
				doc.circle(x, y, 2);
				if (inspection.rfiStatus === opt || inspection.rfiStatus === opt.toUpperCase()) {
					doc.setFillColor(0).circle(x, y, 1, 'F');
				}
				doc.text(opt, x + 5, y + 1);
			});
			y += 10;

			doc.setFont(undefined, 'bold');
			doc.text('Enclosures:', 10, y);
			y += 8;

			const checklistSummary = (inspection.enclosureStates?.[1]?.checklist || []).map(row => [
				safe(row.id),
				safe(row.description),
				safe(row.status),
				safe(row.contractorRemark),
				safe(row.aeRemark),
			]);

			if (checklistSummary.length > 0) {
				doc.autoTable({
					startY: y,
					head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
					body: checklistSummary,
					styles: { fillColor: [255, 255, 255], lineWidth: 0.1 },
					headStyles: { fillColor: [0, 102, 153], textColor: 255 },
				});
				y = doc.lastAutoTable.finalY + 10;
			} else {
				doc.text('No checklist data available.', 15, y);
				y += 10;
			}

			doc.setFont(undefined, 'bold');
			doc.text('Site Images:', 15, y);
			y += 5;

			Object.values(inspection.galleryImages || {}).forEach(img => {
				if (img) {
					y = addImageSafely(img, 15, y);
				}
			});

			if (inspection.selfieImage) {
				doc.setFont(undefined, 'bold');
				doc.text('Selfie Image:', 15, y);
				y += 5;
				y = addImageSafely(inspection.selfieImage, 15, y);
			}

			if (inspection.enclosureStates?.[1]?.contractorSign) {
				doc.setFont(undefined, 'bold');
				doc.text('Contractor Signature:', 15, y);
				y += 5;
				y = addImageSafely(inspection.enclosureStates[1].contractorSign, 15, y, 40, 20);
			}

			if (inspection.enclosureStates?.[1]?.gcSign) {
				doc.setFont(undefined, 'bold');
				doc.text('GC/MRVC Signature:', 100, y);
				y += 5;
				y = addImageSafely(inspection.enclosureStates[1].gcSign, 100, y - 20, 40, 20);
			}


			doc.setFont(undefined, 'bold');
			doc.text('Remarks:', 15, y);
			doc.setFont(undefined, 'normal');
			y += 5;
			const remarkLines = doc.splitTextToSize(safe(inspection.remarks), 180);
			doc.text(remarkLines, 15, y);
			y += remarkLines.length * 6;

		});

		doc.save('All_RFIs.pdf');
	};

	const downloadPDFWithDetails = async (rfiId, idx) => {
	try {
		const res = await axios.get(`http://localhost:8000/getRfiReportDetails/${rfiId}`);
		if (res.data?.length > 0) {
			const inspection = res.data[0];

			// Inject remarks and status
			inspection.remarks = remarksList[idx] || '';
			inspection.rfiStatus = statusList[idx] || '';

			// Convert image URLs to base64 and assign
			const baseURL = 'http://localhost:8000/previewFiles?filepath=';

			const convert = async (src) => (src ? await toBase64(baseURL + encodeURIComponent(src.trim())) : null);

			// Convert images
			inspection.selfieImage = await convert(inspection.selfieClient);
			inspection.contractorSign = await convert(inspection.contractorSignature);
			inspection.gcSign = await convert(inspection.gcMrvcSignature);

			const galleryImgs = inspection.imagesUploadedByClient?.split(',') || [];
			inspection.galleryImages = {};
			for (let i = 0; i < galleryImgs.length; i++) {
				inspection.galleryImages[i] = await convert(galleryImgs[i]);
			}

			await generatePDF([inspection]);
		} else {
			alert("No inspection details found.");
		}
	} catch (err) {
		console.error("Error fetching details for PDF:", err);
	}
};



	const printPreview = () => window.print();

	return (
		<div className="dashboard validation">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<h2 className="validation-heading">Validation</h2>

					<table className="validation-table">
						<thead>
							<tr>
								<th>RFI ID</th>
								<th>Preview</th>
								<th>Download</th>
								<th>Remarks</th>
								<th>Status</th>
								<th>File</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rfiList.map((rfi, idx) => (
								<tr key={idx}>
									<td>{rfi.stringRfiId}</td>
									<td><button onClick={() => fetchPreview(rfi.longRfiId)}>👁️</button></td>
									<button onClick={() => downloadPDFWithDetails(rfi.longRfiId, idx)}>⬇️</button>
									<td>
										<select onChange={(e) => updateRemark(idx, e.target.value)}>
											<option value="">-- Select --</option>
											<option value="NONO">NONO</option>
											<option value="NONOC(B)">NONOC (B)</option>
											<option value="NONOC(C)">NONOC (C)</option>
											<option value="NOR">NOR</option>
										</select>
									</td>
									<td>
										<select onChange={(e) => updateStatus(idx, e.target.value)}>
											<option value="">-- Select --</option>
											<option value="APPROVED">Approved</option>
											<option value="REJECTED">Rejected</option>
											<option value="CLARIFICATION_REQUIRED">Clarification Required</option>
										</select>
									</td>
									<td>
										<input type="file" onChange={(e) => handleFileChange(idx, e.target.files[0])} />
									</td>
									<td>
										<button onClick={() => submitValidation(rfi, idx)}>Validate</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{selectedInspection && (
						<div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
							<div className="popup-content" onClick={(e) => e.stopPropagation()}>
								<h3>RFI Preview</h3>
								<div className="form-row">
									<div className="form-fields" style={{ gridColumn: 'span 1' }}>
										<label>Client:</label>
										<p>Mumbai Rail Vikas Corporation</p>
									</div>
									<div className="form-fields" style={{ gridColumn: 'span 1' }}>
										<label></label>
										<p>Request For Information (RFI)</p>
									</div>

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


								</div>

								<h4>Checklist</h4>
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
											<td>{selectedInspection.drawingStatus || '---'}</td>
											<td>{selectedInspection.drawingRemarksContracotr || '---'}</td>
											<td>{selectedInspection.drawingRemarksClient || '---'}</td>
										</tr>
										{/* Alignment row */}
										<tr>
											<td>2</td>
											<td>Alignment</td>
											<td>{selectedInspection.alignmentStatus || '---'}</td>
											<td>{selectedInspection.alignmentoCntractorRemarks || '---'}</td>
											<td>{selectedInspection.alignmentClientRemarks || '---'}</td>
										</tr>
									</tbody>
								</table>


								<h4>Status & Remarks</h4>
								<p><strong>Status:</strong> {selectedInspection.status || '---'}</p>
								<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>

								{selectedInspection.selfieClient && (
									<div className="image-gallery">
										<h4>Inspector Selfie</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.selfieClient)}`}
											alt="Selfie"
											className="preview-image"
										/>
									</div>
								)}


								{selectedInspection.imagesUploadedByClient && (
									<div className="image-gallery">
										<h4>Site Images By Inspector</h4>
										{selectedInspection.imagesUploadedByClient.split(',').map((img, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(img.trim())}`}
												alt={`Client Image ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}

								{selectedInspection.clientEnclosureFilePaths && (
									<div className="image-gallery">
										<h4>Enclosures Uploaded By Inspector</h4>
										{selectedInspection.clientEnclosureFilePaths.split(',').map((path, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(path.trim())}`}
												alt={`Enclosure ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}

								{selectedInspection.testInsiteLabClient && selectedInspection.testSiteDocumentsClient && (
									<div className="image-gallery">
										<h4>Test Report Uploaded By Inspector</h4>

										{(() => {
											const path = selectedInspection.testSiteDocumentsClient.trim();
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



								{selectedInspection.selfieContractor && (
									<div className="image-gallery">
										<h4>Contractor Selfie</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.selfieContractor)}`}
											alt="Selfie"
											className="preview-image"
										/>
									</div>
								)}


								{selectedInspection.imagesUploadedByContractor && (
									<div className="image-gallery">
										<h4>Site Images By Contractor</h4>
										{selectedInspection.imagesUploadedByContractor.split(',').map((img, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(img.trim())}`}
												alt={`Client Image ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}


								{selectedInspection.contractorEnclosureFilePaths && (
									<div className="image-gallery">
										<h4>Enclosures Uploaded By Contractor</h4>
										{selectedInspection.contractorEnclosureFilePaths.split(',').map((path, idx) => (
											<img
												key={idx}
												src={`${fileBaseURL}?filepath=${encodeURIComponent(path.trim())}`}
												alt={`Enclosure ${idx + 1}`}
												className="preview-image"
											/>
										))}
									</div>
								)}

								{selectedInspection.testInsiteLabContractor && selectedInspection.testSiteDocumentsContractor && (
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







								{selectedInspection.contractorSignature && (
									<div className="image-gallery">
										<h4>Contractor Signature</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.contractorSignature)}`}
											alt="Contractor Signature"
											className="preview-image"
										/>
									</div>
								)}


								{selectedInspection.gcMrvcSignature && (
									<div className="image-gallery">
										<h4>GC/MRVC Signature</h4>
										<img
											src={`${fileBaseURL}?filepath=${encodeURIComponent(selectedInspection.gcMrvcSignature)}`}
											alt="GC Signature"
											className="preview-image"
										/>
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