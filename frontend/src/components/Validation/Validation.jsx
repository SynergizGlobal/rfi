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
      rfiId: 'RFI001',
      location: 'Mumbai, Site A',
      contractorRep: 'John Doe',
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

  const loadLogo = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Mrvc_logo.jpg/600px-Mrvc_logo.jpg';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // fallback if logo fails
    });
  };

  const logo = await loadLogo();

  inspectionListToExport.forEach((inspection, idx) => {
    if (idx !== 0) doc.addPage();
    if (logo) doc.addImage(logo, 'JPEG', 150, 10, 40, 15);

    let y = 30;
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 153);
    doc.text('Mumbai Railway Vikas Corporation', 15, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('REQUEST FOR INSPECTION (RFI)', 15, y);
    y += 10;

    doc.text(`RFI ID: ${inspection.rfiId}`, 15, y);
    y += 8;
    doc.text(`Location: ${inspection.location}`, 15, y);
    y += 8;
    doc.text(`Contractor's Representative: ${inspection.contractorRep}`, 15, y);
    y += 8;

    doc.text('Enclosures:', 15, y);
    y += 5;

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

    y = doc.lastAutoTable.finalY + 10;
    doc.text('Checklist Summary:', 15, y);
    const checklistSummary = inspection.enclosureStates?.[1]?.checklist?.map(row => [
      row.id,
      row.description,
      row.status,
      row.contractorRemark,
      row.aeRemark
    ]) || [];

    doc.autoTable({
      startY: y + 5,
      head: [['ID', 'Description', 'Status', 'Contractor Remarks', 'AE Remarks']],
      body: checklistSummary,
      styles: { fillColor: [255, 255, 255], lineWidth: 0.1 },
      headStyles: { fillColor: [0, 102, 153], textColor: 255 },
    });

    y = doc.lastAutoTable.finalY + 10;
    doc.text('RFI Approval Status:', 15, y);
    y += 8;
    doc.text(`Status: ${inspection.rfiStatus || '---'}`, 15, y);
    y += 8;
    doc.text(`Remarks: ${inspection.remarks || '---'}`, 15, y);
    y += 10;

    doc.text('Site Images:', 15, y);
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
    <div className="dashboard">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <h2 className="validation-heading">Validation</h2>
          <div className="table-container">
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
                {inspectionList.map((inspection, index) => (
                  <tr key={index}>
                    <td>{inspection.rfiId}</td>
                    <td><button onClick={() => setSelectedInspection(inspection)}>👁️</button></td>
                    <td><button onClick={() => generatePDF([inspection])}>⬇️</button></td>
                    <td>
                      <select
                        value={inspection.remarks || ''}
                        onChange={(e) => {
                          const updated = [...inspectionList];
                          updated[index].remarks = e.target.value;
                          setInspectionList(updated);
                        }}>
                        <option value="">-- Select --</option>
                        <option value="NONO">NONO (Notice Of No Objection)</option>
                        <option value="NONOC(B)">NONOC (B) with Comments</option>
                        <option value="NONOC(C)">NONOC (C) with Comments</option>
                        <option value="NOR">NOR (Rejection)</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={inspection.rfiStatus || ''}
                        onChange={(e) => {
                          const updated = [...inspectionList];
                          updated[index].rfiStatus = e.target.value;
                          setInspectionList(updated);
                        }}>
                        <option value="">-- Select --</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                        <option value="Clarification Required">Clarification Required</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button onClick={() => generatePDF(inspectionList)}>Download All as PDF</button>
          </div>

          {selectedInspection && (
            <div className="popup-overlay" onClick={() => setSelectedInspection(null)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h3>RFI Preview</h3>
                <p><strong>RFI ID:</strong> {selectedInspection.rfiId}</p>
                <p><strong>Location:</strong> {selectedInspection.location}</p>
                <p><strong>Contractor's Representative:</strong> {selectedInspection.contractorRep}</p>

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
                        <td>{selectedInspection.enclosureStates?.[e.id]?.uploadedFile?.name || ''}</td>
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
