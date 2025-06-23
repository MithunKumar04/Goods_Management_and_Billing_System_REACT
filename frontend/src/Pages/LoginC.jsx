import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginStyles.css";

function LoginC() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  function validateForm(email, password) {
    if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Password is required.", toastOptions);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm(email, password)) {
      setIsLoading(true);

      try {
        const response = await axios.post("https://goods-management-and-billing-system.onrender.com/", {
          email,
          password,
        });

        if (response.data === "Incorrect password") {
          toast.error("The password is incorrect.", toastOptions);
        } else if (response.data === "User doesnot exist") {
          toast.error("User does not exist.", toastOptions);
        } else {
          toast.success("Login successful!", {
            ...toastOptions,
            onClose: () => {
              navigate(`/home/${response.data.name}`);
            },
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Connection error. Please try again.", toastOptions);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="kcm-login-logo">Karuparayan Cotton Mills</div>

      <div className="login-card">
        <div className="login-header">
          <h2 className="fade-in">Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group slide-in">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <input
                type="email"
                placeholder="Enter your email"
                autoComplete="off"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group slide-in">
            <label htmlFor="password">Password</label>
            <div className="input-container" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""} bounce-in`}
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default LoginC;
