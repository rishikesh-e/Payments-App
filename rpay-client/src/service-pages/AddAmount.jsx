import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/global.css'
import AppBar from "../components/AppBar.jsx";
import App from "../App.jsx";
import Navbar from "../components/NavBar.jsx";

function AddAmount() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [upiPin, setUpiPin] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/get-wallets', {
          withCredentials: true,
        })

        const walletAccounts = res.data.accounts
        setAccounts(walletAccounts)

        //if (walletAccounts.length > 0) {
          //setSelectedAccount(walletAccounts[0].account_number)
        //}
      } catch (err) {
        console.error(err)
        setError('Could not load accounts')
      }
    }

    fetchAccounts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      await axios.post(
        'http://localhost:5000/add-amount',
        {
          account_number: selectedAccount,
          amount,
          upi: upiPin,
        },
        { withCredentials: true }
      )
      setMessage(`Success: ₹${amount} added successfully.`)
      setAmount('')
      setUpiPin('')
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding amount')
    }
  }

  return (
      <>
        <AppBar/>
        <Navbar />
        <div className="auth-container" style={{
          marginLeft: 250,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: 'var(--background)',
          maxWidth: '100vw'
        }}>
          <form onSubmit={handleSubmit} style = {{
            gap: '0.5rem'
          }}>
            <h2>Add Amount to Wallet</h2>

            {accounts.length === 0 && !error ? (
                <p>Loading accounts...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <>
                  <label htmlFor="account-select"></label>
                  <select
                      id="account-select"
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      required
                  >
                    <option value="" disabled>
                      Select an account
                    </option>
                    {accounts.map((acc) => (
                        <option key={acc.account_number} value={acc.account_number}>
                          {acc.account_number}
                        </option>
                    ))}
                  </select>

                  <label htmlFor="amount-input"></label>
                  <div className="input-with-prefix">
                    <input
                        id="amount-input"
                        type="number"
                        min="1"
                        step="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="Enter amount"
                    />
                  </div>

                  <label htmlFor="upi-pin"></label>
                  <input
                      id="upi-pin"
                      type="password"
                      value={upiPin}
                      onChange={(e) => setUpiPin(e.target.value)}
                      required
                      placeholder="Enter UPI PIN"
                  />

                  <button type="submit">Add Amount</button>
                </>
            )}

            {message && <p className="success">{message}</p>}
          </form>
        </div>
      </>
  )
}

export default AddAmount
