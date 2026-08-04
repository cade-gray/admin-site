import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps } from "../interfaces/LoginPropsInterface";

const Login: React.FC<LoginProps> = ({
  loggedIn,
  setLoggedIn,
  username,
  setUsername,
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Create an object containing the login data
    const loginData = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch("https://admin-api.cadegray.dev/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const responseData = await response.json();
      if (response.ok) {
        // Successful login
        const userToken = { user: username, token: responseData.token };
        sessionStorage.setItem("cg-admin-token", JSON.stringify(userToken));
        setLoggedIn(true);
      } else {
        // Login failed
        alert("Login failed: " + responseData.error);
        // Handle login failure
      }
      // You can perform further actions based on the API response
    } catch (error) {
      // Handle errors
      alert("Error logging in: " + error);
    }
  };
  useEffect(() => {
    // If the user is logged in, navigate to "/home"
    if (loggedIn === true) {
      navigate("/home");
    }
  }, [loggedIn, navigate]);
  return (
    <div className="h-screen90 flex flex-col items-center justify-center p-3">
      <div className="flex flex-col items-center justify-center bg-slate-800/60 border border-slate-700 rounded-xl p-8 shadow-lg text-neutral-100">
        <h1 className="mx-auto text-2xl font-mono">CADEGRAY.dev</h1>
        <h1 className="mx-auto text-xl font-mono text-slate-400 mb-5">
          Administration Panel
        </h1>
        <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
          <label>
            <p className="text-sm text-slate-400 mb-1">Username</p>
            <input
              type="text"
              className="bg-slate-900/70 border border-slate-600 rounded-lg p-2 text-neutral-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            <p className="text-sm text-slate-400 mb-1">Password</p>
            <input
              type="password"
              className="bg-slate-900/70 border border-slate-600 rounded-lg p-2 text-neutral-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            className="bg-sky-500 hover:bg-sky-400 text-white font-medium p-2 rounded-lg shadow-md transition"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
