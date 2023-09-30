import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Guests from "./pages/Guests";
import Header from "./components/Header";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  useEffect(() => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const userToken = JSON.parse(tokenString);
    if (userToken != null) {
      setLoggedIn(true);
    }
  }, []);
  return (
    <>
      <BrowserRouter>
        <Header
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          username={username}
          setUsername={setUsername}
        />
        <Routes>
          <Route
            path="/"
            element={
              <Login
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
                username={username}
                setUsername={setUsername}
              />
            }
          ></Route>
          <Route
            path="/home"
            element={
              <Home
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
                username={username}
                setUsername={setUsername}
              />
            }
          ></Route>
          <Route
            path="/guests"
            element={
              <Guests
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
                username={username}
                setUsername={setUsername}
              />
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
