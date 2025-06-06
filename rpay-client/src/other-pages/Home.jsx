import React from 'react';
import Navbar from "../components/NavBar.jsx";
import AppBar from "../components/AppBar.jsx";
import '../styles/global.css'

function HomePage() {
    const userName = localStorage.getItem("userName");
    return (
        <div className="home-page">
            <AppBar />
            <Navbar />
            <div className="home-content">
                <h2>Hi {userName || "User"}</h2>
                <p>Welcome to <strong>XPay</strong> – your all-in-one digital wallet solution.</p>
                <p>
                    With RPay, you can manage your finances securely and efficiently.
                    Our app offers the following features:
                </p>
                <ul>
                    <li><strong>Deposit:</strong> Add money to your wallets from any linked bank.</li>
                    <li><strong>Transfer:</strong> Instantly transfer funds between accounts or users.</li>
                    <li><strong>Transaction History:</strong> View all your past transactions in one place.</li>
                    <li><strong>Download Transactions:</strong> Download a PDF of your transaction records.</li>
                    <li><strong>Check Balance:</strong> See real-time balances of your wallets.</li>
                </ul>
                <p>Get started by exploring the navigation.</p>
            </div>
        </div>
    );
}

export default HomePage;
