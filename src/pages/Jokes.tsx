/*
 * Jokes.tsx
 * Page for adding jokes to the database
 * Created by Cade Gray
 * TODO: Add a history of jokes pulled from API during session.
 * TODO: Move joke pulling and submission to a component. Functions to be placed in lib folder.
 * TODO: Show character count for setup and punchline. Limit to 255 and 40 respectively. Color red if over limit.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps } from "../interfaces/LoginPropsInterface";
import { logoutPost } from "../lib/logoutPost.ts";
const Jokes: React.FC<LoginProps> = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();
  //const [history, setHistory] = useState([]);
  const [setup, setSetup] = useState("");
  const [punchline, setPunchline] = useState("");
  const [jokes, setJokes] = useState([]);
  const handleSetupChange = (event) => {
    setSetup(event.target.value);
  };
  const handlePunchlineChange = (event) => {
    setPunchline(event.target.value);
  };
  useEffect(() => {
    if (!loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);
  useEffect(() => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    // Fetch users from API
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3030/joke/all", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user }),
        });
        // Prevent page from erroring from bad response
        if (!response.ok) {
          const responseCode = response.status;
          if (responseCode === 401) {
            logoutPost();
            sessionStorage.removeItem("cg-admin-token"); // Remove token since it does not exist in database
            setLoggedIn(false);
          }
          return;
        } else {
          const data = await response.json();
          console.log(data);
          setJokes(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [setLoggedIn]);
  return (
    <div className="text-neutral-200">
      <h1 className="text-3xl font-mono m-3">Jokedle Administration</h1>
      <div className="flex flex-col space-y-5 items-center bg-slate-300 m-5 p-5 rounded-md">
        <button
          className="bg-sky-500 p-2 rounded-md shadow-lg hover:scale-110 mt-2 w-64"
          onClick={async () => {
            // TODO: Seperate this into a function and place in lib folder
            const tokenString = sessionStorage.getItem("cg-admin-token");
            const { user, token } = JSON.parse(tokenString);
            const password = {
              password:
                "pw4extrasecurityincasetokeniscompromisednotmuchsecurebutbetterthannothing",
            };
            const response = await fetch("http://localhost:3030/pulljoke", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ user, password }),
            });
            const data = await response.json();
            if (!data.success) {
              alert("Error pulling joke: " + data.error);
            } else {
              setSetup(data.setup);
              setPunchline(data.punchline);
            }
          }}
        >
          Pull New Joke from Dad Jokes API
        </button>
        <label className="text-md text-neutral-700">Setup</label>
        <textarea
          className="bg-neutral-700 text-neutral-200 p-2 rounded-md h-64 w-64"
          placeholder="Setup"
          onChange={handleSetupChange}
          value={setup}
          maxLength={255}
        ></textarea>
        <label className="text-md text-neutral-700">Punchline</label>
        <textarea
          className="bg-neutral-700 text-neutral-200 p-2 rounded-md h-64 w-64"
          placeholder="Punchline"
          maxLength={40}
          onChange={handlePunchlineChange}
          value={punchline}
        ></textarea>
        <button
          className="bg-green-500 p-2 rounded-md shadow-lg hover:scale-110 mt-2 w-64"
          onClick={async () => {
            // TODO: Seperate this into a function and place in lib folder
            const joke = {
              setup: setup,
              punchline: punchline,
            };
            const tokenString = sessionStorage.getItem("cg-admin-token");
            const { user, token } = JSON.parse(tokenString);
            const response = await fetch("https://api.cadegray.dev/joke", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ user, joke }),
            });

            const data = await response.json();
            if (data.success) {
              alert("Joke submitted successfully!");
            } else {
              alert("Error submitting joke: " + data.error);
            }
          }}
        >
          Submit Joke to Database
        </button>
      </div>
      <div className="flex justify-center">
        <table className="text-center max-w-xl">
          <thead className="bg-neutral-100 text-slate-700 text-sm">
            <tr>
              <th>JokeID</th>
              <th>Setup</th>
              <th>Punchline</th>
            </tr>
          </thead>
          <tbody className="">
            {jokes.map((joke) => (
              <tr key={joke.jokeId}>
                <td className="border px-1 py-1">{joke.jokeId}</td>
                <td className="border px-1 py-1">{joke.setup}</td>
                <td className="border px-1 py-1">{joke.punchline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Jokes;
