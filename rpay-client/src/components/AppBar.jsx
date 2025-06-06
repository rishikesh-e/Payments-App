import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import '../styles/global.css'

function AppBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", { withCredentials: true });
      alert("Logged out successfully");
      localStorage.removeItem('userName')
      navigate("/");
    } catch {
      alert("Logout failed");
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <div className="app-bar">
      <span
        className="app-bar-logo"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
        title="Go to Home"
      >
        RPay - A Payments App
      </span>
      <div className="app-bar-actions">
        <button className="app-bar-button" onClick={handleProfile}>Profile</button>
        <button className="app-bar-button primary" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default AppBar;
