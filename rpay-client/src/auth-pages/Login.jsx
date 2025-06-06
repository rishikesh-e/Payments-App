import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import '../styles/global.css'

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await axios.post("http://localhost:5000/login", {
                email,
                password,
            }, { withCredentials: true })

            localStorage.setItem("userName", response.data.name)

            alert(response.data.message)
            navigate("/home")
        } catch (error) {
            alert(error.response?.data?.message || "Login failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <h2>Welcome to RPay</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p>Forgot password ? <Link to="/forgot-password">Click here</Link></p>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    );
}

export default Login