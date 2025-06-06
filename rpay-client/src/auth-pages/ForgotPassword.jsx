import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/global.css';

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleOnSendOtp = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await axios.post("http://localhost:5000/forgot-password", {
                email,
            }, { withCredentials: true });

            localStorage.setItem("otpEmail", email);
            setMessage(response.data.message);
            navigate("/verify-otp");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP");
        }
    };

    return (
        <div className="auth-container"
        style={{
            justifyContent: "flex-start",
            paddingTop: "6rem",
        }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleOnSendOtp}>
                <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send OTP</button>
            </form>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default ForgotPassword;
