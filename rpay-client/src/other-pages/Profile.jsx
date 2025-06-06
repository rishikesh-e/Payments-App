import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/global.css'
import App from "../App.jsx";
import AppBar from "../components/AppBar.jsx";
import Navbar from "../components/NavBar.jsx";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          withCredentials: true,
        });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (error)
    return (
      <div className="profile-container">
        <div className="profile-card">{error}</div>
      </div>
    );
  if (!profile)
    return (
      <div className="profile-container">
        <div className="profile-card">Loading profile...</div>
      </div>
    );

  return (
      <>
        <AppBar/>
        <Navbar/>
        <div className="profile-container" style={{
          marginLeft: '200px'
        }}>
          <div className="profile-card">
            <h2>Profile</h2>
            <div className="profile-field">
              <strong>Name:</strong> <span>{profile.name}</span>
            </div>
            <div className="profile-field">
              <strong>User ID:</strong> <span>{profile.user_id}</span>
            </div>
            <div className="profile-field">
              <strong>Email:</strong> <span>{profile.email}</span>
            </div>
            <div className="profile-field">
              <strong>Number of Accounts:</strong> <span>{profile.accounts_count}</span>
            </div>
            <div className="profile-field">
              <strong>Number of Transactions:</strong> <span>{profile.transactions_count}</span>
            </div>
          </div>
        </div>
      </>

  );
}

export default Profile;
