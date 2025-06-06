import React, { useState } from 'react';
import axios from 'axios';
import AppBar from "../components/AppBar.jsx";
import Navbar from "../components/NavBar.jsx";

const DownloadTransactions = () => {
  const [upiPin, setUpiPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!upiPin) {
      setError('Please enter your UPI PIN');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.get('http://localhost:5000/download-transactions', {
        params: { upi: upiPin },
        responseType: 'blob',
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transaction_history.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid UPI PIN. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to download transactions');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar />
      <Navbar />
      <div style={{
        maxWidth: '400px',
        margin: '4rem auto',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        marginTop: '200px',
        marginLeft:'640px'

      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Download Transaction History</h2>

        <input
          type="password"
          placeholder="Enter UPI PIN"
          value={upiPin}
          maxLength={4}
          inputMode="numeric"
          onChange={(e) => setUpiPin(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            marginBottom: '1rem'
          }}
        />

        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.6rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#aaa' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Downloading...' : 'Download PDF'}
        </button>

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
      </div>
    </>
  );
};

export default DownloadTransactions;
