import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps } from "../interfaces/LoginPropsInterface";
const Home: React.FC<LoginProps> = ({ loggedIn, setLoggedIn, username }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const userToken = JSON.parse(tokenString);

    if (!userToken) {
      setLoggedIn(false);
    }
  }, [setLoggedIn]);

  // useEffect for navigation
  useEffect(() => {
    if (!loggedIn) {
      sessionStorage.removeItem("cg-admin-token");
      navigate("/");
    }
  }, [loggedIn, navigate]);

  return (
    <>
      <h1 className="text-3xl font-mono bg-slate-700 text-neutral-100">
        Welcome {username}!
      </h1>
    </>
  );
};

export default Home;
