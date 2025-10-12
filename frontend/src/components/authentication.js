"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    position: "relative",
    overflow: "hidden",
  },
  cardBefore: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    borderRadius: "16px 16px 0 0",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a202c",
    textAlign: "center",
    marginBottom: "32px",
    marginTop: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#667eea",
    backgroundColor: "white",
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    position: "relative",
    overflow: "hidden",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
  },
  toggleButton: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    color: "#667eea",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "16px",
  },
  toggleButtonHover: {
    borderColor: "#667eea",
    backgroundColor: "#f7fafc",
  },
  errorMessage: {
    color: "#e53e3e",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#fed7d7",
    borderRadius: "8px",
    border: "1px solid #feb2b2",
  },
  successMessage: {
    color: "#38a169",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#c6f6d5",
    borderRadius: "8px",
    border: "1px solid #9ae6b4",
  },
}

function Authentication({ setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [focusedInput, setFocusedInput] = useState("")
  const [hoveredButton, setHoveredButton] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSuccess(false)

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", { email, password })
        setUser({ name: res.data.name, email: res.data.email })
        localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email }))
        navigate("/")
      } else {
        await axios.post("http://localhost:5000/api/auth/register", { name, email, password })
        setIsLogin(true)
        setIsSuccess(true)
        setName("")
        setEmail("")
        setPassword("")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong")
    }
  }

  const getInputStyle = (inputName) => ({
    ...styles.input,
    ...(focusedInput === inputName ? styles.inputFocus : {}),
  })

  const getButtonStyle = (buttonName) => ({
    ...styles.button,
    ...(hoveredButton === buttonName ? styles.buttonHover : {}),
  })

  const getToggleButtonStyle = () => ({
    ...styles.toggleButton,
    ...(hoveredButton === "toggle" ? styles.toggleButtonHover : {}),
  })

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardBefore}></div>
        <h2 style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput("")}
                style={getInputStyle("name")}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput("")}
              style={getInputStyle("email")}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput("")}
              style={getInputStyle("password")}
              required
            />
          </div>

          <button
            type="submit"
            style={getButtonStyle("submit")}
            onMouseEnter={() => setHoveredButton("submit")}
            onMouseLeave={() => setHoveredButton("")}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button
          style={getToggleButtonStyle()}
          onMouseEnter={() => setHoveredButton("toggle")}
          onMouseLeave={() => setHoveredButton("")}
          onClick={() => {
            setIsLogin(!isLogin)
            setError("")
            setIsSuccess(false)
            setName("")
            setEmail("")
            setPassword("")
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {isSuccess && (
          <div style={styles.successMessage}>Registration successful! Please sign in with your credentials.</div>
        )}
      </div>
    </div>
  )
}

export default Authentication
