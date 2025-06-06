import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import '../styles/global.css';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [upi, setUpi] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const response = await axios.post(`http://localhost:5000/register`, {
                username,
                password,
                email,
                upi
            }, { withCredentials: true });
            alert(response.data.message);
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container"
        style={{
            justifyContent: "flex-start",
            paddingTop: "1.5rem",
        }}>
            <h2>Welcome to XPay</h2>
            <h2>Create your account</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="UPI Pin"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p>Already having an account? <Link to="/">Login to your Account</Link></p>
        </div>
    );
}

export default Register;
