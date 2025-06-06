import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppBar from "../components/AppBar.jsx";
import Navbar from "../components/NavBar.jsx";
import'../styles/global.css'

const TransferForm = () => {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');
  const [showUPIModal, setShowUPIModal] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-wallets', {
          withCredentials: true, // include cookies/session
        });
        setAccounts(response.data.accounts || []);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        alert('Could not load accounts.');
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromAccount || !toAccount || !amount) {
      alert('Please fill in all fields');
      return;
    }

    if (fromAccount === toAccount) {
      alert('From and To account must be different');
      return;
    }

    setShowUPIModal(true);
  };

  const confirmTransfer = async () => {
    if (upi.length !== 4) {
      alert('UPI PIN must be 4 digits');
      return;
    }

    const payload = {
      from_account: fromAccount,
      to_account: toAccount,
      amount,
      upi
    };

    try {
      const response = await axios.post('http://localhost:5000/transfer', payload, {
        withCredentials: true,
      });
      alert(response.data.message);

      if (response.status === 200) {
        setFromAccount('');
        setToAccount('');
        setAmount('');
        setUpi('');
        setShowUPIModal(false);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert(error.response?.data?.message || 'Transfer failed');
    }
  };

  return (
      <>
        <AppBar/>
        <Navbar/>
        <div className="transfer-form" style={{
          marginTop: '70px'
        }}>
          <form onSubmit={handleSubmit}>
            <h2>Transfer Money</h2>
            <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                required
            >
              <option value="">Select From Account</option>
              {accounts.map((acc) => (
                  <option key={acc.account_number} value={acc.account_number}>
                    {acc.account_number}
                  </option>
              ))}
            </select>
            <input
                type="text"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="Enter recipient account number"
                required
            />
            <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
            />
            <button type="submit">Continue</button>
          </form>
          {showUPIModal && (
              <div className="upi-modal">
                <div className="modal-content">
                  <h3>Enter UPI PIN</h3>
                  <input
                      type="password"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      placeholder="UPI PIN"
                      maxLength={4}
                      required
                  />
                  <button onClick={confirmTransfer}>Confirm Transfer</button>
                  <button onClick={() => setShowUPIModal(false)}>Cancel</button>
                </div>
              </div>
          )}
        </div>
      </>

  );
};

export default TransferForm;
