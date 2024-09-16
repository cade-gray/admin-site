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
import JokeSequence from "../components/JokeSequence.tsx";
const Jokes: React.FC<LoginProps> = ({
  loggedIn,
  setLoggedIn,
  username,
  setUsername,
}) => {
  const navigate = useNavigate();
  //const [history, setHistory] = useState([]);
  const [jokeSubmissions, setJokeSubmissions] = useState([]);
  const [setup, setSetup] = useState("");
  const [punchline, setPunchline] = useState("");
  const [formattedPunchline, setFormattedPunchline] = useState("");
  const [jokes, setJokes] = useState([]);
  const handleSetupChange = (event) => {
    setSetup(event.target.value);
  };
  const handlePunchlineChange = (event) => {
    setPunchline(event.target.value);
    setFormattedPunchline(event.target.value);
  };
  const handleFmtdPunchlineChange = (event) => {
    setFormattedPunchline(event.target.value);
  };

  // Possibly move these functions to a lib folder
  const fetchJokes = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    // Fetch users from API
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.cadegray.dev/joke/all", {
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
          setJokes(data);
        }
      } catch (error) {
        alert("Error pulling all jokes: " + error);
      }
    };
    fetchData();
  };

  const fetchJokeSubmissions = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    // Fetch users from API
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.cadegray.dev/joke/submission/all",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user }),
          }
        );
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
          setJokeSubmissions(data);
        }
      } catch (error) {
        alert("Error pulling joke submissions: " + error);
      }
    };
    fetchData();
    console.log(jokeSubmissions);
  };
  useEffect(() => {
    if (!loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);
  useEffect(() => {
    fetchJokes();
    fetchJokeSubmissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="text-neutral-200">
      <h1 className="text-3xl font-mono m-3">Jokedle Administration</h1>
      <div className="flex flex-col space-y-5 items-center bg-slate-300 m-5 p-5 rounded-md">
        <button
          className="bg-sky-500 p-2 rounded-md shadow-lg hover:scale-110 mt-2 w-64"
          onClick={async () => {
            // TODO: Seperate all of this into a function and place in lib folder
            const tokenString = sessionStorage.getItem("cg-admin-token");
            const { user, token } = JSON.parse(tokenString);
            // This is dumb, I am already sending a token so why do I need a password?  What was I thinking?
            const password = {
              password:
                "pw4extrasecurityincasetokeniscompromisednotmuchsecurebutbetterthannothing",
            };
            const response = await fetch("https://api.cadegray.dev/pulljoke", {
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
              setFormattedPunchline(data.punchline);
            }
          }}
        >
          Pull New Joke from Dad Jokes API
        </button>
        <h2 className="text-2xl font-mono text-neutral-700">
          Joke Submissions
        </h2>
        <table className="text-black text-center">
          <thead className="bg-neutral-100 text-slate-700 text-sm">
            <tr>
              <th>Submission ID</th>
              <th>Setup</th>
              <th>Punchline</th>
              <th>Source</th>
              <th>Add</th>
            </tr>
          </thead>
          {jokeSubmissions.map((submission) => (
            <tr key={submission.submissionid}>
              <td className="border px-1 py-1">{submission.submissionid}</td>
              <td className="border px-1 py-1">{submission.setup}</td>
              <td className="border px-1 py-1">{submission.punchline}</td>
              <td className="border px-1 py-1">{submission.source}</td>
              <td className="border px-1 py-1">
                <button
                  className="bg-green-500 p-2 rounded-md shadow-lg hover:scale-110 mt-2"
                  onClick={() => {
                    setSetup(submission.setup);
                    setPunchline(submission.punchline);
                    setFormattedPunchline(submission.punchline);
                  }}
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </table>
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
          maxLength={50}
          onChange={handlePunchlineChange}
          value={punchline}
        ></textarea>
        <label className="text-md text-neutral-700">Formatted Punchline</label>
        <textarea
          className="bg-neutral-700 text-neutral-200 p-2 rounded-md w-full"
          placeholder="Formatted Punchline"
          maxLength={75}
          onChange={handleFmtdPunchlineChange}
          value={formattedPunchline}
        ></textarea>
        <div className="grid grid-cols-12 grid-rows-6 bg-white text-black">
          {Array.from(formattedPunchline, (char, index) => (
            <div
              key={index}
              className={`m-1 p-1 flex items-center justify-center text-2xl font-semibold ${
                char === " " || char === "\n" ? "bg-gray-400/20" : "bg-gray-300"
              }`}
            >
              {char === " " ? "" : char}
            </div>
          ))}
        </div>
        <button
          className="bg-green-500 p-2 rounded-md shadow-lg hover:scale-110 mt-2 w-64"
          onClick={async () => {
            // TODO: Seperate this into a function and place in lib folder
            const joke = {
              setup: setup,
              punchline: punchline,
              formattedPunchline: formattedPunchline,
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
              fetchJokes();
            } else {
              alert("Error submitting joke: " + data.error);
            }
          }}
        >
          Submit Joke to Database
        </button>
      </div>
      <JokeSequence
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        username={username}
        setUsername={setUsername}
      />
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
