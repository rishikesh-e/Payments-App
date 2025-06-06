import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
import Login from "./auth-pages/Login"
import Home from "./other-pages/Home.jsx"
import Register from "./auth-pages/Register.jsx"
import AddWallet from "./service-pages/AddWallet.jsx"
import ForgotPassword from "./auth-pages/ForgotPassword.jsx"
import VerifyOtp from "./auth-pages/VerifyOtp.jsx"
import ResetPassword from "./auth-pages/ResetPassword.jsx"
import TransferAmount from "./service-pages/TransferAmount.jsx"
import Transactions from "./service-pages/Transactions.jsx"
import AddAmount from "./service-pages/AddAmount.jsx"
import Profile from "./other-pages/Profile.jsx"
import DownloadTransactions from "./service-pages/DownloadTransactions.jsx"
import BalanceChecker from "./service-pages/BalanceChecker.jsx"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-wallet" element={<AddWallet />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/transfer" element={<TransferAmount />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/deposit" element={<AddAmount />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/download-transactions" element={<DownloadTransactions />} />
        <Route path="/account-balance" element={<BalanceChecker />} />
      </Routes>
    </Router>
  )
}

export default App