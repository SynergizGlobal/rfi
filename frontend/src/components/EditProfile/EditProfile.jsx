import React, { useState, useRef, useEffect } from 'react';
import HeaderRight from '../HeaderRight/HeaderRight';
import './EditProfile.css';

const userId = localStorage.getItem("userId");
const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(false);
  const [form, setForm] = useState({
    email: profile.email,
    phone: profile.phone,
    personalNumber: profile.personalNumber
  });
  const [profileImg, setProfileImg] = useState(null);
  const [userMap, setUserMap] = useState({});
  const fileInputRef = useRef(null);

  // Edit/save/cancel handlers
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      email: profile.email,
      phone: profile.phone,
      personalNumber: profile.personalNumber
    });
  };
  
  useEffect(() => {
    if (!userId) return;

    // Fetch profile
    fetch(`${API_BASE_URL}api/profile/${userId}`)
      .then(res => res.json())
      .then(data => setProfile(data));

    // Fetch all users
    fetch(`${API_BASE_URL}api/users`)
      .then(res => res.json())
      .then(users => {
        const map = {};
        users.forEach(u => {
          map[u.userId] = u.userName;
        });
        setUserMap(map);
      });
  }, []);
   
   const handleChange = (e) => {
     const { name, value } = e.target;

     // Update form
     setForm(f => ({ ...f, [name]: value }));

     // Validate length
     if (name === "phone" || name === "personalNumber") {
       setErrors(err => ({
         ...err,
         [name]: value.length !== 10
       }));
     }
   };
  
  const [errors, setErrors] = useState({
    phone: false,
    personalNumber: false
  });
  
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/profile/${userId}/contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error("Failed to update");

      const result = await response.text();
      console.log("✅ Update successful:", result);
      setProfile(p => ({ ...p, ...form }));
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert("Failed to update contact info. Please try again.");
    }
  };

  // Image upload handler
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImg(ev.target.result); // this is a base64 URL
    };
    reader.readAsDataURL(file);
  };

  // Click avatar to trigger file select dialog
  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  
  const isFormValid = !errors.phone && !errors.personalNumber;

  return (
    <div className="dashboard create-rfi editprofile">
      <HeaderRight />
      <div className="right">
        <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 page-heading">
            Edit Profile
          </h2>
          <div className="profile-container" style={{
            display: 'flex',
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            width: '100%'
          }}>
            {/* Left Section */}
            <div style={{
              background: '#199CC8',
              background: 'linear-gradient(320deg,rgba(25, 156, 200, 1) 0%, rgba(19, 35, 74, 1) 100%)',
              color: '#fff',
              minWidth: 200,
              padding: '2rem 1.2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              {/* Avatar upload area */}
              <div
              onClick={handleAvatarClick}
              style={{
                width: 80, height: 80, background: '#fff', borderRadius: '50%',
                marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer', border: '2px solid #ffffff90',
                position: 'relative'
              }}
              title="Change profile picture"
            >
              {profileImg
                ? <img src={profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 38, color: '#bbb' }}>👤</span>
              }
              <span
                className="avatar-camera-overlay"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 10,
                  background: 'rgba(0,0,0,0.60)',
                  borderRadius: '50%',
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.17s',
                  pointerEvents: 'none'
                }}
              >
                <i className="fa fa-camera" style={{ color: '#fff', fontSize: 17 }} />
              </span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />
            </div>
              <h2 style={{ margin: 0, fontSize: 20 }}>{profile.name}</h2>
              <div style={{ opacity: 0.92, fontWeight: 500, marginBottom: 6 }}>{profile.role}</div>
              <button
                className="profile-edit-btn"
                style={{
                  background: 'transparent', border: '1.5px solid #fff', borderRadius: 4,
                  padding: '6px 20px', color: '#fff', marginTop: 18, cursor: 'pointer'
                }}
                onClick={handleEdit}
                disabled={isEditing}
              >
                Edit
              </button>
            </div>
            {/* Right Section */}
            <div style={{ flex: 1, padding: '2rem 1.5rem', background: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Personal Information */}
              <div className='info-block personal-information'>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: 7, borderBottom: '1px solid #e7e7e7', paddingBottom: 4 }}>Information</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap'}}>
                  <div>
                    <div style={{ color: '#888', fontSize: 13 }}>Department</div>
                    <div style={{ fontWeight: 500 }}>{profile.department}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', fontSize: 13 }}>Reporting To</div>
                    <div style={{ fontWeight: 500 }}>{userMap[profile.reportingTo] || profile.reportingTo}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', fontSize: 13 }}>Extension</div>
                    <div style={{ fontWeight: 500 }}>{profile.extension}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', fontSize: 13 }}>Pmis Key</div>
                    <div style={{ fontWeight: 500 }}>{profile.pmisKey}</div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className='info-block personal-information'>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: 7, borderBottom: '1px solid #e7e7e7', paddingBottom: 4 }}>User Details</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: '#888', fontSize: 13 }}>User Role</div>
                    <div style={{ fontWeight: 500 }}>{profile.userRole}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', fontSize: 13 }}>User Type</div>
                    <div style={{ fontWeight: 500 }}>{profile.userType}</div>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div className='info-block contact-information'>
                <div style={{ fontWeight: 600, color: '#333', marginBottom: 7, borderBottom: '1px solid #e7e7e7', paddingBottom: 4 }}>Contact Information</div>
                <div className="profile-info-row" style={{ display: 'flex', gap: 30, marginBottom: 2, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#888' }}>Email</div>
                    {isEditing
                      ? <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          style={{ width: 180, padding: 4, borderRadius: 4, border: '1px solid #ddd' }}
                        />
                      : <div style={{ fontWeight: 500 }}>{profile.email}</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#888' }}>Phone</div>
                    {isEditing
                      ? <input
						  type="text"
						  name="phone"
						  value={form.phone}
						  onChange={handleChange}
						  maxLength={10}
						  style={{ width: 120, padding: 4, borderRadius: 4, border: errors.phone ? '1px solid red' : '1px solid #ddd' }}
						/>
                      : <div style={{ fontWeight: 500 }}>{profile.phone}</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#888' }}>Personal Number</div>
                    {isEditing
                      ? <input
                          type="text"
                          name="personalNumber"
                          value={form.personalNumber}
                          onChange={handleChange}
						  maxLength={10}
                          style={{ width: 120, padding: 4, borderRadius: 4, border: errors.personalNumber ? '1px solid red' : '1px solid #ddd' }}
                        />
                      : <div style={{ fontWeight: 500 }}>{profile.personalNumber}</div>
                    }
                  </div>
                </div>
                {isEditing &&
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={handleSave}
					  disabled={errors.phone || errors.personalNumber}
                      style={{ background: '#3f51b5', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 22px', marginRight: 10, cursor: 'pointer' }}
                    >Save</button>
                    <button
                      onClick={handleCancel}
                      style={{ background: 'transparent', color: '#f857a6', border: '1px solid #f857a6', borderRadius: 4, padding: '6px 22px', cursor: 'pointer' }}
                    >Cancel</button>
                  </div>
                }
              </div>
              {/* Social */}
              {/* <div style={{ marginTop: 26, display: 'flex', gap: 14 }}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook"><i className="fa fa-facebook" style={{ color: '#1976d2', fontSize: 22 }} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter"><i className="fa fa-twitter" style={{ color: '#4e94e9', fontSize: 22 }} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram"><i className="fa fa-instagram" style={{ color: '#ef37a6', fontSize: 22 }} /></a>
              </div> */ }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
