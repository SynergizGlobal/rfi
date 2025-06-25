import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import CameraCapture from '../CameraCapture/CameraCapture';
import './InspectionForm.css';

const initialChecklist = [
  { id: 1, description: 'Drawing Approved and available', status: '', contractorRemark: '', aeRemark: '' },
  { id: 2, description: 'Shuttering aligned and dimensionally correct', status: '', contractorRemark: '', aeRemark: '' },
];

const enclosuresData = [
  { id: 1, rfiDescription: 'PCC', enclosure: 'Level Sheet' },
  { id: 2, rfiDescription: 'PCC', enclosure: 'Pour Card' },
];

export default function InspectionForm() {
  const location = useLocation();
  const id = location.state?.rfi;
  const [rfiData, setRfiData] = useState(null);
  const [step, setStep] = useState(1);
  const [locationText, setLocationText] = useState('');
  const [contractorRep, setContractorRep] = useState('');
    const [confirmPopup, setConfirmPopup] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState({});
  const [enclosureStates, setEnclosureStates] = useState({});
  const [checklistPopup, setChecklistPopup] = useState(null);
  const [uploadPopup, setUploadPopup] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('environment');

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/rfi/rfi-details/${id}`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setRfiData(data);
          setContractorRep(data.nameOfRepresentative || '');
        })
        .catch(err => console.error("Error fetching RFI:", err));
    }
  }, [id]);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setLocationText(data.display_name || `Lat: ${lat}, Lng: ${lng}`);
          } catch {
            setLocationText(`Lat: ${lat}, Lng: ${lng}`);
          }
        },
        () => setLocationText('Location access denied')
      );
    }
  };

  const handleChecklistSubmit = (id, data, contractorSign, gcSign) => {
    setEnclosureStates(prev => ({
      ...prev,
      [id]: { ...prev[id], checklist: data, checklistDone: true, contractorSign, gcSign }
    }));
    setChecklistPopup(null);
  };

  const handleUploadSubmit = (id, file) => {
    setEnclosureStates(prev => ({
      ...prev,
      [id]: { ...prev[id], uploadedFile: file }
    }));
    setUploadPopup(null);
  };

  if (!rfiData) return <div>Loading RFI details...</div>;

  return (
    <div className="dashboard create-rfi inspection-form">
      <HeaderRight />
      <div className="right">
        <div className="dashboard-main">
          <div className="rfi-inspection-form">

            {/* Step 1 */}
            {step === 1 && (
              <div className="form-step">
                <h2>RFI Inspection - Step 1</h2>
                <div className="form-grid">
                  <div className="form-left">
                    <label>RFI ID:</label><input type="text" readOnly value={rfiData.rfi_Id} />
                    <label>Project:</label><input type="text" readOnly value={rfiData.project} />
                    <label>Contract:</label><input type="text" readOnly value={rfiData.contract} />
                    <label>Structure:</label><input type="text" readOnly value={rfiData.structure} />
                    <label>Activity:</label><input type="text" readOnly value={rfiData.activity} />
                    <label>RFI Description:</label><input type="text" readOnly value={rfiData.rfiDescription} />
                    <label>Description:</label><input type="text" readOnly value={rfiData.description} />
                  </div>
                  <div className="upload-section">
                    <label>Selfie:</label>
                    {selfieImage ? (
                      <img src={selfieImage} alt="Selfie" className="selfie-preview" />
                    ) : (
                      <button onClick={() => { setCameraMode('user'); setShowCamera('selfie'); }}>📷 Capture Selfie</button>
                    )}
                    {!selfieImage && <p className="error">*Selfie required</p>}
                  </div>
                </div>
                <button disabled={!selfieImage} onClick={() => setStep(2)} className="next-btn">Next</button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="form-step">
                <h2>RFI Inspection - Step 2</h2>
                <div className="form-grid">
                  <div className="form-left">
                    <label>Location:</label>
                    <input value={locationText} onFocus={fetchLocation} onChange={e => setLocationText(e.target.value)} />
                    <label>Date of Inspection:</label>
                    <input type="date" value={rfiData.dateOfInspection} readOnly />
                    <label>Time of Inspection:</label>
                    <input type="time" value={rfiData.timeOfInspection} readOnly />
                    <label>Contractor's Representative:</label>
                    <input value={contractorRep} onChange={e => setContractorRep(e.target.value)} />
                  </div>
                  <div className="upload-grid">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="capture-option">
                        <button onClick={() => { setCameraMode('environment'); setShowCamera(`gallery-${i}`); }}>
                          📷 Capture Image {i}
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setGalleryImages(prev => ({ ...prev, [`gallery-${i}`]: url }));
                            }
                          }}
                        />
                        {galleryImages[`gallery-${i}`] && (
                          <img src={galleryImages[`gallery-${i}`]} alt={`Site ${i}`} className="gallery-preview" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <h3>Enclosures</h3>
                <table className="enclosure-table">
                  <thead>
                    <tr><th>RFI Description</th><th>Enclosure</th><th>Action</th><th>Uploaded</th></tr>
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
                onDone={(data, contractorSign, gcSign) =>
                  handleChecklistSubmit(checklistPopup, data, contractorSign, gcSign)
                }
                onClose={() => setChecklistPopup(null)}
              />
            )}

            {uploadPopup && (
              <UploadPopup
                onSubmit={file => handleUploadSubmit(uploadPopup, file)}
                onClose={() => setUploadPopup(null)}
              />
            )}
            
              {confirmPopup && <ConfirmationPopup onClose={() => setConfirmPopup(false)} />}

            {showCamera && (
              <div className="popup">
                <CameraCapture
                  facingMode={cameraMode}
                  onCapture={(img) => {
                    if (showCamera === 'selfie') setSelfieImage(img);
                    else setGalleryImages(prev => ({ ...prev, [showCamera]: img }));
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
    setChecklist(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  return (
    <div className="popup">
    	<div class="form-row">
    		<div class="form-fields flex-1">
    			<label>Name Of Work:</label>
    			<input type="text" name="work_name" id="work_name"  value="" disabled />
    		</div>
    	</div>
    	<div class="form-row">
    		<div class="form-fields flex-2">
    			<label>Location:</label>
    			<input type="text" name="location_ch" id="location_ch"  value="" disabled />
    		</div>
    		<div class="form-fields flex-2">
    			<label>Date:</label>
    			<input type="text" name="date" id="date"  value="" disabled />
    		</div>
    	</div>
    	<div class="form-row">
    		<div class="form-fields flex-2">
    			<label>Structure Type:</label>
    			<input type="text" name="structure_type" id="structure_type"  value="" disabled />
    		</div>
    		<div class="form-fields flex-2">
    			<label>Component:</label>
    			<input type="text" name="component" id="component"  value="" disabled />
    		</div>
    	</div>
    	<div class="form-row">
    		<div class="form-fields flex-2">
    			<label>RFI No:</label>
    			<input type="text" name="rfi_id" id="rfi_id"  value="" disabled />
    		</div>
    		<div class="form-fields flex-2">
    			<label>Grade of Concrete:</label>
    			<input type="text" name="concrete_grade" id="concrete_grade"  value="" />
    		</div>
    	</div>
      <h3>CHECKLIST FOR CONCRETE/SHUTTERING & REINFORCEMENT</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Description</th><th>Yes</th><th>No</th><th>N/A</th><th>Contractor Remark</th><th>AE Remark</th></tr>
        </thead>
        <tbody>
          {checklist.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.description}</td>
              <td><input type="radio" checked={row.status === 'Yes'} onChange={() => handleChange(row.id, 'status', 'Yes')} /></td>
              <td><input type="radio" checked={row.status === 'No'} onChange={() => handleChange(row.id, 'status', 'No')} /></td>
              <td><input type="radio" checked={row.status === 'NA'} onChange={() => handleChange(row.id, 'status', 'NA')} /></td>
              <td><input value={row.contractorRemark} onChange={e => handleChange(row.id, 'contractorRemark', e.target.value)} /></td>
              <td><input value={row.aeRemark} onChange={e => handleChange(row.id, 'aeRemark', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <label>Contractor Signature:</label>
      <input type="file" onChange={(e) => setContractorSignature(e.target.files[0])} />
      <label>GC Signature:</label>
      <input type="file" onChange={(e) => setGcSignature(e.target.files[0])} />

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
      <h3>Upload File</h3>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <div className="popup-actions">
        <button disabled={!file} onClick={() => onSubmit(file)}>Upload</button>
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
