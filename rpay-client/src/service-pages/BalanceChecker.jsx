import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppBar from "../components/AppBar.jsx";
import Navbar from "../components/NavBar.jsx";

const BalanceChecker = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [balance, setBalance] = useState(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/get-wallets',
        {
          withCredentials:true
        })
      .then(res => {
        setWallets(res.data.accounts);
      })
      .catch(err => {
        console.error('Error fetching wallets:', err);
        setError('Failed to load wallets');
      });
  }, []);

  const handleProceed = () => {
    if (!selectedAccount) {
      setError('Please select an account');
      return;
    }
    setError('');
    setShowPinPrompt(true);
  };

  const handleCheckBalance = () => {
    if (!upiPin) {
      setError('Please enter your UPI PIN');
      return;
    }

    axios.get('http://localhost:5000/get-balance', {
      params: {
        account_number: selectedAccount,
        upi: upiPin
      },
      withCredentials:true
    })
      .then(res => {
        setBalance(res.data.balance);
        setShowPinPrompt(false);
        setError('');
      })
      .catch(err => {
        console.error('Balance fetch error:', err);
        if (err.response && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to fetch balance');
        }
      });
  };

  return (
      <>
        <AppBar/>
        <Navbar/>
        <div style={{
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          marginTop: '200px',
          marginLeft:'600px'
        }}>
          <h2 style={{marginBottom: '1rem'}}>Select Wallet</h2>

          <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
          >
            <option value="">-- Select Account --</option>
            {wallets.map(wallet => (
                <option key={wallet.account_number} value={wallet.account_number}>
                  {wallet.account_number}
                </option>
            ))}
          </select>

          <button
              onClick={handleProceed}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
          >
            Proceed
          </button>

          {showPinPrompt && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fff',
                border: '1px dashed #aaa',
                borderRadius: '8px'
              }}>
                <h3 style={{marginBottom: '1rem'}}>Enter UPI PIN</h3>
                <input
                    type="password"
                    value={upiPin}
                    onChange={(e) => setUpiPin(e.target.value)}
                    placeholder="Enter your UPI PIN"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      marginBottom: '1rem'
                    }}
                />
                <button
                    onClick={handleCheckBalance}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '1rem',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                >
                  Check Balance
                </button>
              </div>
          )}

          {balance !== null && (
              <div style={{
                marginTop: '1rem',
                fontSize: '1.2rem',
                color: '#2e7d32',
                fontWeight: 'bold'
              }}>
                Balance: ₹{balance}
              </div>
          )}

          {error && (
              <p style={{color: 'red', marginTop: '1rem', fontSize: '0.95rem'}}>{error}</p>
          )}
        </div>

      </>

  );
};

export default BalanceChecker;
