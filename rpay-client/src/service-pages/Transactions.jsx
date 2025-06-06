import React, { useState } from 'react';
import axios from 'axios';
import AppBar from "../components/AppBar.jsx";
import Navbar from "../components/NavBar.jsx";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchTransactions = async () => {
  if (!upiPin) {
    setError('Please enter your UPI PIN');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const response = await axios.get('http://localhost:5000/get-transactions', {
      params: { upi_pin: upiPin },  // Corrected parameter name
      withCredentials: true
    });

    setTransactions(response.data);
    setIsAuthenticated(true);
  } catch (err) {
    if (err.response?.status === 401) {
      setError('Invalid UPI PIN. Please try again.');
    } else {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    }
    setTransactions([]);
    setIsAuthenticated(false);
  } finally {
    setLoading(false);
  }
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffsetMs);

    return istDate.toLocaleString('en-IN', {
      hour12: true,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'debit' ? '-' : '+';
    return `${sign}₹${amount.toFixed(2)}`;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUpiPin('');
    setTransactions([]);
  };

  return (
      <>
        <AppBar/>
        <Navbar/>
        <div className="transactions-container">
          {!isAuthenticated ? (
              <div className="auth-section">
                <h2>Transaction History</h2>
                <div className="upi-pin-input">
                  <input
                      type="password"
                      value={upiPin}
                      onChange={(e) => setUpiPin(e.target.value)}
                      placeholder="Enter UPI PIN"
                      maxLength="4"
                      inputMode="numeric"
                  />
                  <button onClick={fetchTransactions} disabled={loading}>
                    {loading ? 'Verifying...' : 'View Transactions'}
                  </button>
                </div>
                {error && <div className="error-message">{error}</div>}
              </div>
          ) : (
              <>
                <div className="transactions-list">
                  {loading ? (
                      <div className="loading">Loading transactions...</div>
                  ) : transactions.length === 0 ? (
                      <div className="no-transactions">No transactions found</div>
                  ) : (
                      transactions.map((txn) => (
                          <div key={txn.id} className={`transaction-card ${txn.type}`}>
                            <div className="transaction-header">
                              <span className="transaction-type">{txn.type.toUpperCase()}</span>
                              <span className="transaction-amount">
                      {formatAmount(txn.amount, txn.type)}
                    </span>
                            </div>

                            <div className="transaction-details">
                              <p>{txn.description || 'No description provided'}</p>

                              {txn.type === 'credit' && (
                                  <>
                                    <p>From Account: {txn.sender_account_number}</p>
                                    <p>Sender: {txn.sender_name}</p>
                                  </>
                              )}

                              {txn.type === 'debit' && (
                                  <>
                                    <p>To Account: {txn.receiver_account_number}</p>
                                    <p>Recipient: {txn.receiver_name}</p>
                                  </>
                              )}

                              {txn.type === 'deposit' && (
                                  <p>Deposited to: {txn.receiver_account_number}</p>
                              )}

                              <p>Date: {formatDate(txn.date)}</p>
                              <p>Balance After Transaction: ₹{txn.current_balance.toFixed(2)}</p>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </>
          )}
        </div>
      </>

  );
};

export default Transactions;
