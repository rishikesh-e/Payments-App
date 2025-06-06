import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button onClick={() => navigate('/add-wallet')}>Add Wallet</button>
      <button onClick={() => navigate('/deposit')}>Deposit</button>
      <button onClick={() => navigate('/transfer')}>Transfer</button>
      <button onClick={() => navigate('/transactions')}>Transaction History</button>
      <button onClick={() => navigate('/download-transactions')}>Download Transactions</button>
      <button onClick={() => navigate('/account-balance')}>Account Balance</button>
    </div>
  );
};

export default Navbar;
