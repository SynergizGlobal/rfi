import React, { useState } from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import CameraCapture from '../CameraCapture/CameraCapture';
import './InspectionForm.css';

const initialChecklist = [
  { id: 1, description: 'Drawing Approved and available', status: '', contractorRemark: '', aeRemark: '' },
  { id: 2, description: 'Alignment, dimension and plumb of shuttering are ok', status: '', contractorRemark: '', aeRemark: '' },
];

const enclosuresData = [
  { id: 1, rfiDescription: 'PCC', enclosure: 'Level Sheet' },
  { id: 2, rfiDescription: 'PCC', enclosure: 'Pour Card' },
];

export default function InspectionForm() {
  const [step, setStep] = useState(1);
  const [checklistPopup, setChecklistPopup] = useState(null);
  const [uploadPopup, setUploadPopup] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [uploadedSelfie, setUploadedSelfie] = useState(null);
  const [enclosureStates, setEnclosureStates] = useState({});
  const [contractorRep, setContractorRep] = useState('');
  const [location, setLocation] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [cameraMode, setCameraMode] = useState('user');
  const [galleryImages, setGalleryImages] = useState({});

  const handleChecklistSubmit = (id, data, contractorSign, gcSign) => {
    setEnclosureStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        checklist: data,
        checklistDone: true,
        contractorSign,
        gcSign
      },
    }));
    setChecklistPopup(null);
  };

  const handleUploadSubmit = (id, file) => {
    setEnclosureStates(prev => ({
      ...prev,
      [id]: { ...prev[id], uploadedFile: file },
    }));
    setUploadPopup(null);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            setLocation(data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          } catch (error) {
            console.error('Reverse geocoding failed', error);
            setLocation(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          }
        },
        () => console.warn('Location access denied')
      );
    } else {
      console.warn('Geolocation not supported');
    }
  };


  return (
    <div className="dashboard create-rfi">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-inspection-form">
            {step === 1 && (
              <div className="form-step">
                <h2>RFI Inspection</h2>
                <div className="form-grid">
                  <div className="form-left">
                    <label>RFI ID:</label><input type="text" readOnly value="" />
                    <label>Work:</label><input type="text" readOnly value="" />
                    <label>Contract:</label><input type="text" readOnly value="" />
                    <label>Contractor:</label><input type="text" readOnly value="" />
                    <label>Activity:</label><input type="text" readOnly value="" />
                    <label>RFI Description:</label><input type="text" readOnly value="" />
                    <label>Description:</label><input type="text" readOnly value="" />
                    <label>Chainage:</label><input type="text" value="" />
                  </div>
                  <div className="upload-section">
                    <label>Selfie</label>
                    {selfieImage ? (
                      <img src={selfieImage} alt="Selfie" className="selfie-preview" />
                    ) : (
                      <button onClick={() => { setCameraMode('user'); setShowCamera('selfie'); }}>📷 Capture Selfie</button>
                    )}
                    {!selfieImage && <p className="error">*Please capture selfie to continue</p>}
                  </div>
                </div>
                <button disabled={!selfieImage} onClick={() => setStep(2)} className="next-btn">Next</button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>Attach Images of Site</h2>
                <div className="form-grid">
                  <div className="form-left">
                    <label>Location:</label>
                   <input
                      type="text"
                      value={location}
                      onFocus={() => { if (!location) fetchLocation(); }}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter or auto-fetch location"
                    />
                    <label>Date of Inspection:</label><input type="date" />
                    <label>Time of Inspection:</label><input type="time" readOnly value={new Date().toLocaleTimeString()} />
                    <label>Name of Contractor’s Representative:</label>
                    <input type="text" value={contractorRep} onChange={(e) => setContractorRep(e.target.value)} />
                  </div>
                  <div className="upload-grid">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="capture-option">
                        <button onClick={() => { setCameraMode('environment'); setShowCamera(`gallery-${i}`); }}>📷 Capture Image {i}</button>
                        <label className="file-upload">
                          📁 Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setGalleryImages(prev => ({ ...prev, [`gallery-${i}`]: url }));
                              }
                            }}
                          />
                        </label>
                        {galleryImages[`gallery-${i}`] && (
                          <img
                            src={galleryImages[`gallery-${i}`]}
                            alt={`Captured ${i}`}
                            className="gallery-preview"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <h3>Enclosures</h3>
                <div className="table-scroll-wrapper">
                  <table className="enclosure-table">
                    <thead>
                      <tr>
                        <th>RFI Description</th>
                        <th>Enclosure</th>
                        <th>Action</th>
                        <th>View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enclosuresData.map(e => {
                        const state = enclosureStates[e.id] || {};
                        return (
                          <tr key={e.id}>
                            <td>{e.rfiDescription}</td>
                            <td>{e.enclosure}</td>
                            <td>
                              <button disabled={state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Open</button>
                              <button disabled={!state.checklistDone} onClick={() => setChecklistPopup(e.id)}>Edit</button>
                              <button onClick={() => setUploadPopup(e.id)}>Upload</button>
                            </td>
                            <td>{state.uploadedFile?.name || ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="btn-row">
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-blue">Save</button>
                  <button className="btn btn-green" onClick={() => setConfirmPopup(true)}>Submit</button>
                </div>
              </div>
            )}

            {checklistPopup && (
              <ChecklistPopup
                data={enclosureStates[checklistPopup]?.checklist || initialChecklist}
                contractorSign={enclosureStates[checklistPopup]?.contractorSign || null}
                gcSign={enclosureStates[checklistPopup]?.gcSign || null}
                onDone={(data, contractorSign, gcSign) => handleChecklistSubmit(checklistPopup, data, contractorSign, gcSign)}
                onClose={() => setChecklistPopup(null)}
              />
            )}

            {uploadPopup && (
              <UploadPopup
                onSubmit={(file) => handleUploadSubmit(uploadPopup, file)}
                onClose={() => setUploadPopup(null)}
              />
            )}

            {confirmPopup && <ConfirmationPopup onClose={() => setConfirmPopup(false)} />}

            {showCamera && (
              <div className="popup">
                <CameraCapture
                  facingMode={cameraMode}
                  onCapture={(imageData) => {
                    if (showCamera === 'selfie') {
                      setSelfieImage(imageData);
                    } else {
                      setGalleryImages(prev => ({ ...prev, [showCamera]: imageData }));
                    }
                    setShowCamera(false);
                  }}
                  onCancel={() => setShowCamera(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistPopup({ data, contractorSign, gcSign, onDone, onClose }) {
  const [checklist, setChecklist] = useState(data);
  const [contractorSignature, setContractorSignature] = useState(contractorSign);
  const [gcSignature, setGcSignature] = useState(gcSign);

  const handleChange = (id, field, value) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="popup">
      <h3>Checklist for Concrete/Shuttering & Reinforcement</h3>
      <table>
        <thead>
          <tr>
            <th>S.No</th><th>Description</th><th>Yes</th><th>No</th><th>N/A</th><th>Remarks by Contractor</th><th>Remarks by AE</th>
          </tr>
        </thead>
        <tbody>
          {checklist.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.description}</td>
              <td><input type="radio" name={`status-${row.id}`} onChange={() => handleChange(row.id, 'status', 'Yes')} checked={row.status === 'Yes'} /></td>
              <td><input type="radio" name={`status-${row.id}`} onChange={() => handleChange(row.id, 'status', 'No')} checked={row.status === 'No'} /></td>
              <td><input type="radio" name={`status-${row.id}`} onChange={() => handleChange(row.id, 'status', 'NA')} checked={row.status === 'NA'} /></td>
              <td><input value={row.contractorRemark} onChange={e => handleChange(row.id, 'contractorRemark', e.target.value)} /></td>
              <td><input value={row.aeRemark} onChange={e => handleChange(row.id, 'aeRemark', e.target.value)} /></td>
            </tr>
          ))}
          <tr>
            <td colSpan="3">
              <label>Contractor’s Representative Signature:</label>
              <input type="file" accept="image/*" onChange={(e) => setContractorSignature(e.target.files[0])} />
              {contractorSignature && <img src={URL.createObjectURL(contractorSignature)} alt="Contractor Sign" className="signature-preview" />}
            </td>
            <td colSpan="3">
              <label>GC/MRVC’s Representative Signature:</label>
              <input type="file" accept="image/*" onChange={(e) => setGcSignature(e.target.files[0])} />
              {gcSignature && <img src={URL.createObjectURL(gcSignature)} alt="GC Sign" className="signature-preview" />}
            </td>
            <td></td>
          </tr>
          <tr>
            
          </tr>
        </tbody>
      </table>

      <div className="popup-actions">
        <button onClick={() => onDone(checklist, contractorSignature, gcSignature)}>Done</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function UploadPopup({ onSubmit, onClose }) {
  const [file, setFile] = useState(null);
  return (
    <div className="popup">
      <h3>Upload Enclosure</h3>
      <input type="file" accept="image/*" capture="environment" onChange={e => setFile(e.target.files[0])} />
      <div className="popup-actions">
        <button onClick={() => onSubmit(file)} disabled={!file}>Upload</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function ConfirmationPopup({ onClose }) {
  return (
    <div className="popup">
      <h3>Confirm Inspection</h3>
      <label>Inspection Status</label>
      <input type="text" placeholder="Enter status" />
      <label>Tests in Site/Lab</label>
      <select name="tests_site" id="tests_site">
        <option value="">Select</option>
      </select>
      <div className="popup-actions">
        <button onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
