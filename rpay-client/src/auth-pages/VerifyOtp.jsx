import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/global.css';

function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const email = localStorage.getItem("otpEmail");
        if (!email) {
            setError("Email not found. Please go back and request OTP again.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/verify-otp", {
                email,
                otp
            }, { withCredentials: true });

            setMessage(response.data.message);
            alert('OTP verified')
            localStorage.removeItem("otpEmail");
            navigate("/reset-password");
        } catch (err) {
            setError(err.response?.data?.message || "OTP verification failed");
        }
    };

    return (
        <div className="auth-container"
        style={{
            justifyContent: "flex-start",
            paddingTop: "6rem",
        }}>
            <h2>Verify OTP</h2>
            <form onSubmit={handleVerifyOtp}>
                <input
                    type="text"
                    placeholder="Enter the OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button type="submit">Verify</button>
            </form>
            {message && <p style={{ color: "var(--success)" }}>{message}</p>}
            {error && <p style={{ color: "var(--error)" }}>{error}</p>}
        </div>
    );
}

export default VerifyOtp;
