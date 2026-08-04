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
      <div className="max-w-5xl mx-auto">
        <div className="m-5 p-6 bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg">
          <h1 className="text-3xl font-mono text-neutral-100">
            Welcome {username}!
          </h1>
        </div>
      </div>
    </>
  );
};

export default Home;
