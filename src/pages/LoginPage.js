import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Link, useNavigate, Navigate } from "react-router-dom";
import "./LoginPage.style.css";
import LoadingSpinner from "../components/LoadingSpinner";

const LoginPage = ({ user, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector(".login-logo-text").classList.add("animated");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/user/login", { email, password });
      if (response.status === 200) {
        setUser(response.data.user);
        sessionStorage.setItem("token", response.data.token);
        api.defaults.headers["authorization"] = "Bearer " + response.data.token;
        setError("");
        navigate("/");
      }
      throw new Error(response.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-page-wrapper">
        {loading ? (
        <LoadingSpinner />
      ) : (
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo-text">
            <h1>todo</h1>
          </div>
          <p className="login-subtitle">
            좋은 하루예요! 오늘을 계획해보러 갈까요?
          </p>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="login-error-message">{error}</div>}
          <button type="submit" className="login-button">
            Get started
          </button>
        </form>
        <div className="login-footer">
          <p>
            Don't have An Account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
          )}
    </div>
  );
};

export default LoginPage;
