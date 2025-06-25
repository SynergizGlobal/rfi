

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Validation.css';
import HeaderRight from '../HeaderRight/HeaderRight';

const enclosuresData = [
	{ id: 1, rfiDescription: 'PCC', enclosure: 'Level Sheet' },
	{ id: 2, rfiDescription: 'PCC', enclosure: 'Pour Card' },
];

export default function Validation() {
	const [inspectionList, setInspectionList] = useState([
		{
			client: 'Mumbai Rail Vikas Corporation',
			consultant: 'XYZ Consultants',
			contract: 'P04W02',
			contractor: 'ABC Constructions Pvt. Ltd.',
			contractId: 'P04W02',
			rfiId: 'P4EN3/ABC/0115/RFI/00001/R1',
			dateOfInspection: '2025-06-25',
			proposedTime: '10:00 AM',
			actualTime: '10:30 AM',
			location: 'Mumbai, Site A',
			contractorRep: 'John Doe',
			clientRep: 'Jane Smith',
			contractorDescription: 'Concrete pouring as per approved drawing.',
			clientComments: 'Verified at site, looks good.',
			rfiStatus: '',
			remarks: '',
			selfieImage: 'data:image/png;base64,...',
			galleryImages: {
				'gallery-1': 'data:image/png;base64,...',
				'gallery-2': ''
			},
			enclosureStates: {
				1: {
					uploadedFile: { name: 'LevelSheet.pdf' },
					contractorSign: 'data:image/png;base64,...',
					gcSign: 'data:image/png;base64,...',
					checklist: [
						{ id: 1, description: 'Drawing Approved', status: 'Yes', contractorRemark: 'Ok', aeRemark: 'Fine' },
						{ id: 2, description: 'Shuttering aligned', status: 'Yes', contractorRemark: 'Aligned', aeRemark: 'Checked' },
					]
				},
				2: {
					uploadedFile: { name: 'PourCard.pdf' }
				}
			}
		}
	]);

	const [selectedInspection, setSelectedInspection] = useState(null);

	const generatePDF = async (inspectionListToExport) => {
		const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
		const loadLogo = () => new Promise(resolve => {
			const img = new Image();
			img.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Mrvc_logo.jpg/600px-Mrvc_logo.jpg';
			img.onload = () => resolve(img);
			img.onerror = () => resolve(null);
		});

		const logo = await loadLogo();

		inspectionListToExport.forEach((inspection, idx) => {
			if (idx !== 0) doc.addPage();
			if (logo) doc.addImage(logo, 'JPEG', 150, 10, 40, 15);
			let y = 30;

			doc.setFontSize(10);
			doc.text(`Client: ${inspection.client}`, 15, y);
			doc.setFontSize(12);
			doc.text('REQUEST FOR INSPECTION (RFI)', 105, y);
			y += 8;

			doc.setFontSize(10);
			doc.text(`Consultant: ${inspection.consultant}`, 15, y);
			doc.text(`Contract: ${inspection.contract}`, 75, y);
			doc.text(`Contractor: ${inspection.contractor}`, 135, y);
			y += 6;
			doc.text(`Contract ID: ${inspection.contractId}`, 15, y);
			doc.text(`RFI ID: ${inspection.rfiId}`, 75, y);
			y += 6;
			doc.text(`Date of Inspection: ${inspection.dateOfInspection}`, 15, y);
			doc.text(`Location: ${inspection.location}`, 75, y);
			doc.text(`Proposed Time: ${inspection.proposedTime}`, 135, y);
			y += 6;
			doc.text(`Actual Time: ${inspection.actualTime}`, 15, y);
			y += 6;
			doc.text(`Contractor’s Representative: ${inspection.contractorRep}`, 15, y);
			doc.text(`Client Representative: ${inspection.clientRep}`, 105, y);
			y += 10;

			doc.setFont(undefined, 'bold');
			doc.text('Description by Contractor:', 15, y);
			doc.setFont(undefined, 'normal');
			y += 5;
			doc.text(doc.splitTextToSize(inspection.contractorDescription || '---', 180), 15, y);
			y += 12;

			doc.setFont(undefined, 'bold');
			doc.text('Comments by Client:', 15, y);
			doc.setFont(undefined, 'normal');
			y += 5;
			doc.text(doc.splitTextToSize(inspection.clientComments || '---', 180), 15, y);
			y += 12;

			doc.setFont(undefined, 'bold');
			doc.text('RFI Approval Status:', 15, y);
			y += 6;
			const statusOptions = ['Approved', 'Rejected', 'Approved with Comments'];
			statusOptions.forEach((opt, i) => {
				const x = 15 + i * 60;
				doc.circle(x, y, 2);
				if (inspection.rfiStatus === opt) doc.setFillColor(0).circle(x, y, 1, 'F');
				doc.text(opt, x + 5, y + 1);
			});
			y += 10;

			doc.setFont(undefined, 'bold');
			doc.text('Enclosures:', 15, y);
			doc.setFont(undefined, 'normal');
			y += 2;

			const enclosureTable = enclosuresData.map(e => [
				e.rfiDescription,
				e.enclosure,
				inspection.enclosureStates?.[e.id]?.uploadedFile?.name || ''
			]);

			doc.autoTable({
				startY: y,
				head: [['RFI Description', 'Enclosure', 'File Name']],
				body: enclosureTable,
				styles: { fillColor: [255, 255, 255], lineWidth: 0.1 },
				headStyles: { fillColor: [0, 102, 153], textColor: 255 },
			});

			y = doc.lastAutoTable.finalY + 5;
			doc.setFont(undefined, 'bold');
			doc.text('Checklist Summary:', 15, y);
			doc.setFont(undefined, 'normal');
			const checklistSummary = inspection.enclosureStates?.[1]?.checklist?.map(row => [
				row.id,
				row.description,
				row.status,
				row.contractorRemark,
				row.aeRemark
			]) || [];

			doc.autoTable({
				startY: y + 3,
				head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
				body: checklistSummary,
				styles: { fillColor: [255, 255, 255], lineWidth: 0.1 },
				headStyles: { fillColor: [0, 102, 153], textColor: 255 },
			});

			y = doc.lastAutoTable.finalY + 10;
			doc.setFont(undefined, 'bold');
			doc.text('Site Images:', 15, y);
			doc.setFont(undefined, 'normal');
			y += 5;
			Object.values(inspection.galleryImages || {}).forEach(img => {
				if (img) {
					doc.addImage(img, 'JPEG', 15, y, 50, 40);
					y += 45;
				}
			});

			if (inspection.selfieImage) {
				doc.text('Selfie Image:', 15, y);
				doc.addImage(inspection.selfieImage, 'JPEG', 15, y + 5, 50, 40);
				y += 50;
			}

			if (inspection.enclosureStates?.[1]?.contractorSign) {
				doc.text('Contractor Signature:', 15, y);
				doc.addImage(inspection.enclosureStates[1].contractorSign, 'JPEG', 15, y + 5, 40, 20);
				y += 25;
			}

			if (inspection.enclosureStates?.[1]?.gcSign) {
				doc.text('GC/MRVC Signature:', 100, y - 25);
				doc.addImage(inspection.enclosureStates[1].gcSign, 'JPEG', 100, y - 20, 40, 20);
			}
		});

		doc.save('All_RFIs.pdf');
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
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{inspectionList.map((inspection, idx) => (
								<tr key={idx}>
									<td>{inspection.rfiId}</td>
									<td><button onClick={() => setSelectedInspection(inspection)}>👁️</button></td>
									<td><button onClick={() => generatePDF([inspection])}>⬇️</button></td>
									<td>
										<select
											value={inspection.remarks || ''}
											onChange={(e) => {
												const updated = [...inspectionList];
												updated[idx].remarks = e.target.value;
												setInspectionList(updated);
											}}>
											<option value="">-- Select --</option>
											<option value="NONO">NONO</option>
											<option value="NONOC(B)">NONOC (B)</option>
											<option value="NONOC(C)">NONOC (C)</option>
											<option value="NOR">NOR</option>
										</select>
									</td>
									<td>
										<select
											value={inspection.rfiStatus || ''}
											onChange={(e) => {
												const updated = [...inspectionList];
												updated[idx].rfiStatus = e.target.value;
												setInspectionList(updated);
											}}>
											<option value="">-- Select --</option>
											<option value="Approved">Approved</option>
											<option value="Rejected">Rejected</option>
											<option value="Clarification Required">Clarification Required</option>
										</select>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<button onClick={() => generatePDF(inspectionList)}>Download All as PDF</button>

					{selectedInspection && (
						<div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
							<div className="popup-content" onClick={(e) => e.stopPropagation()}>
								<h3>RFI Preview</h3>
								<div className="form-row">
								
									<div className="form-fields">
										<label>Client:</label> 
										<p>{selectedInspection.client}</p>
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
										<label>Proposed Time:</label> 
										<p>{selectedInspection.proposedTime}</p>
									</div>
									
									<div className="form-fields">
										<label>Actual Time:</label> 
										<p>{selectedInspection.actualTime}</p>
									</div>
									
									<div className="form-fields">
										<label>Location:</label> 
										<p>{selectedInspection.location}</p>
									</div>
									
									<div className="form-fields">
										<label>Contractor's Representative:</label> 
										<p>{selectedInspection.contractorRep}</p>
									</div>
									
									<div className="form-fields">
										<label>Client Representative:</label> 
										<p>{selectedInspection.clientRep}</p>
									</div>
									
									<div className="form-fields">
										<label>Description by Contractor:</label> 
										<p>{selectedInspection.contractorDescription}</p>
									</div>
									
									<div className="form-fields">
										<label>Comments by Client:</label> 
										<p>{selectedInspection.clientComments}</p>
									</div>
									
								</div>

								<h4>Enclosures</h4>
								<table className="preview-table">
									<thead>
										<tr><th>Description</th><th>Enclosure</th><th>File</th></tr>
									</thead>
									<tbody>
										{enclosuresData.map(e => (
											<tr key={e.id}>
												<td>{e.rfiDescription}</td>
												<td>{e.enclosure}</td>
												<td>{selectedInspection.enclosureStates?.[e.id]?.uploadedFile?.name || '---'}</td>
											</tr>
										))}
									</tbody>
								</table>

								<h4>Checklist</h4>
								<table className="preview-table">
									<thead>
										<tr><th>ID</th><th>Description</th><th>Status</th><th>Contractor Remarks</th><th>AE Remarks</th></tr>
									</thead>
									<tbody>
										{(selectedInspection.enclosureStates?.[1]?.checklist || []).map(row => (
											<tr key={row.id}>
												<td>{row.id}</td>
												<td>{row.description}</td>
												<td>{row.status}</td>
												<td>{row.contractorRemark}</td>
												<td>{row.aeRemark}</td>
											</tr>
										))}
									</tbody>
								</table>

								<h4>Status & Remarks</h4>
								<p><strong>Status:</strong> {selectedInspection.rfiStatus || '---'}</p>
								<p><strong>Remarks:</strong> {selectedInspection.remarks || '---'}</p>

								{selectedInspection.selfieImage && (
									<div>
										<h4>Inspector Selfie</h4>
										<img src={selectedInspection.selfieImage} alt="Selfie" className="preview-image" />
									</div>
								)}

								<h4>Site Images</h4>
								<div className="image-gallery">
									{Object.values(selectedInspection.galleryImages || {}).map((img, idx) => (
										img ? <img key={idx} src={img} alt={`Site ${idx + 1}`} className="preview-image" /> : null
									))}
								</div>

								{selectedInspection.enclosureStates?.[1]?.contractorSign && (
									<div>
										<h4>Contractor Signature</h4>
										<img src={selectedInspection.enclosureStates[1].contractorSign} alt="Contractor Sign" className="preview-image" />
									</div>
								)}
								{selectedInspection.enclosureStates?.[1]?.gcSign && (
									<div>
										<h4>GC/MRVC Signature</h4>
										<img src={selectedInspection.enclosureStates[1].gcSign} alt="GC Sign" className="preview-image" />
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
