import React, { useState } from "react";
import axios from "axios";
import '../styles/global.css'
import AppBar from "../components/AppBar.jsx";
import Navbar from "../components/NavBar.jsx";

function AddWallet() {
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [wallet, setWallet] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAddWallet = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/add-wallet",
        {
          bank: bank,
          account_number: accountNumber,
        },
        { withCredentials: true }
      );
      setWallet(response.data.wallet);
      setMessage(response.data.message);
      setBank("");
      setAccountNumber("");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
      <>
        <AppBar/>
        <Navbar/>
        <div className="auth-container" style={{
          marginLeft: 250,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--background)',
          maxWidth: '100vw'
        }}>


          <form onSubmit={handleAddWallet}>
            <h2>Add Wallet</h2>
            <input
                type="text"
                placeholder="Bank Name"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
            />

            <button type="submit">Add Wallet</button>
          </form>

          {message && <p style={{color: "var(--success)"}}>{message}</p>}
          {error && <p style={{color: "var(--error)"}}>{error}</p>}

          {wallet && (
              <div style={{marginTop: "1rem", background: "var(--card)", padding: "1rem", borderRadius: "0.5rem"}}>
                <h4>Wallet Info:</h4>
                <p><strong>ID:</strong> {wallet.id}</p>
                <p><strong>Bank:</strong> {wallet.bank}</p>
                <p><strong>Account Number:</strong> {wallet.account_number}</p>
                <p><strong>Balance:</strong> ₹{wallet.balance}</p>
              </div>
          )}
        </div>
      </>
  );
}

export default AddWallet;
