import {useState} from "react";
import axios from "axios"
import {useNavigate} from "react-router-dom";
import '../styles/global.css';

function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleResetPassword = async(e) => {
        e.preventDefault()
        setMessage('')
        setError('')
        if(password !== confirmPassword) {
            setError("Passwords do not match")
            return ;
        }
        const email = localStorage.getItem("otpEmail")
        try {
            const response = await axios.post('http://localhost:5000/reset-password',
            {
                email,
                password
            }, {withCredentials: true})
            setMessage(response.data.message);
            localStorage.removeItem("otpEmail");
            alert('Password reset successful, login to continue')
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed")
        }
    }
    return (
        <div className="auth-container"
            style={{
                justifyContent: "flex-start",
                paddingTop: "4rem",
            }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default ResetPassword
