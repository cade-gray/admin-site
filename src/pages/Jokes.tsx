/*
 * Jokes.tsx
 * Page for adding and updating jokes in the database
 * Created by Cade Gray
 * TODO: Add a history of jokes pulled from API during session.
 * TODO: Move joke pulling and submission to a component. Functions to be placed in lib folder.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps } from "../interfaces/LoginPropsInterface";
import { logoutPost } from "../lib/logoutPost.ts";
import JokeSequence from "../components/JokeSequence.tsx";

interface Joke {
  jokeId: number;
  setup: string;
  punchline: string;
  formattedPunchline?: string;
  source?: string;
}

const emptyEdit = {
  setup: "",
  punchline: "",
  formattedPunchline: "",
  source: "",
};

const inputStyles =
  "bg-slate-900/70 border border-slate-600 rounded-lg p-2 text-neutral-200 placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition";

const Jokes: React.FC<LoginProps> = ({
  loggedIn,
  setLoggedIn,
  username,
  setUsername,
}) => {
  const navigate = useNavigate();
  //const [history, setHistory] = useState([]);
  const [setup, setSetup] = useState("");
  const [punchline, setPunchline] = useState("");
  const [formattedPunchline, setFormattedPunchline] = useState("");
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editJoke, setEditJoke] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  // The grid previews the joke being edited, otherwise the new-joke form
  const previewText =
    editingId !== null ? editJoke.formattedPunchline : formattedPunchline;

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

  // Possibly move this to a lib folder
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

  const startEdit = (joke: Joke) => {
    setEditingId(joke.jokeId);
    setEditJoke({
      setup: joke.setup ?? "",
      punchline: joke.punchline ?? "",
      formattedPunchline: joke.formattedPunchline ?? joke.punchline ?? "",
      source: joke.source ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditJoke(emptyEdit);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    const tokenString = sessionStorage.getItem("cg-admin-token");
    if (!tokenString) {
      setLoggedIn(false);
      return;
    }
    const { user, token } = JSON.parse(tokenString);
    setSaving(true);
    try {
      const response = await fetch(
        `https://jokedle-api.cadegray.dev/joke/id/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-User": user,
          },
          body: JSON.stringify({ joke: editJoke }),
        },
      );
      if (response.status === 401) {
        logoutPost();
        sessionStorage.removeItem("cg-admin-token");
        setLoggedIn(false);
        return;
      }
      const data = await response.json();
      if (response.ok && data.success !== false) {
        cancelEdit();
        fetchJokes();
      } else {
        alert("Error updating joke: " + (data.error ?? response.status));
      }
    } catch (error) {
      alert("Error updating joke: " + error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);
  useEffect(() => {
    fetchJokes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="text-neutral-200 max-w-5xl mx-auto pb-10">
      <h1 className="text-3xl font-mono m-3 text-neutral-100">
        Jokedle Administration
      </h1>
      <div className="flex flex-col space-y-5 items-center bg-slate-800/60 border border-slate-700 m-5 p-6 rounded-xl shadow-lg">
        <button
          className="bg-sky-500 hover:bg-sky-400 text-white font-medium p-2 rounded-lg shadow-md transition w-64"
          onClick={async () => {
            // TODO: Seperate this into a function and place in lib folder
            const tokenString = sessionStorage.getItem("cg-admin-token");
            const { user, token } = JSON.parse(tokenString);
            const password = {
              password:
                "pw4extrasecurityincasetokeniscompromisednotmuchsecurebutbetterthannothing",
            };
            const response = await fetch("https://admin-api.cadegray.dev/joke", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`,
                "X-User": user,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <label className="flex flex-col gap-1 text-sm text-slate-400">
            Setup
            <textarea
              className={`${inputStyles} h-32`}
              placeholder="Setup"
              onChange={handleSetupChange}
              value={setup}
              maxLength={255}
            ></textarea>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-400">
            Punchline
            <textarea
              className={`${inputStyles} h-32`}
              placeholder="Punchline"
              maxLength={50}
              onChange={handlePunchlineChange}
              value={punchline}
            ></textarea>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm text-slate-400 w-full">
          Formatted Punchline
          <textarea
            className={inputStyles}
            placeholder="Formatted Punchline"
            maxLength={75}
            onChange={handleFmtdPunchlineChange}
            value={formattedPunchline}
          ></textarea>
        </label>
        <div className="w-full">
          <p className="text-sm text-slate-400 mb-1 text-center">
            Grid Preview{" "}
            {editingId !== null && (
              <span className="text-amber-400">— editing joke #{editingId}</span>
            )}
          </p>
          <div className="grid grid-cols-12 bg-slate-900/70 border border-slate-700 rounded-lg p-2">
            {Array.from(previewText, (char, index) => (
              <div
                key={index}
                className={`m-0.5 aspect-square flex items-center justify-center text-xl font-semibold rounded ${
                  char === " " || char === "\n"
                    ? "bg-slate-700/40"
                    : "bg-neutral-200 text-slate-900"
                }`}
              >
                {char === " " ? "" : char}
              </div>
            ))}
          </div>
        </div>
        <button
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium p-2 rounded-lg shadow-md transition w-64"
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
      <div className="m-5 bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-mono text-neutral-100 px-5 pt-4 pb-2">
          Joke Database
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Setup</th>
                <th className="px-4 py-3">Punchline</th>
                <th className="px-4 py-3">Formatted Punchline</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {jokes.map((joke) =>
                editingId === joke.jokeId ? (
                  <tr key={joke.jokeId} className="bg-slate-700/40">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {joke.jokeId}
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className={`${inputStyles} w-full text-sm`}
                        rows={3}
                        maxLength={255}
                        value={editJoke.setup}
                        onChange={(e) =>
                          setEditJoke({ ...editJoke, setup: e.target.value })
                        }
                      ></textarea>
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className={`${inputStyles} w-full text-sm`}
                        rows={3}
                        maxLength={50}
                        value={editJoke.punchline}
                        onChange={(e) =>
                          setEditJoke({
                            ...editJoke,
                            punchline: e.target.value,
                          })
                        }
                      ></textarea>
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className={`${inputStyles} w-full text-sm`}
                        rows={3}
                        maxLength={75}
                        value={editJoke.formattedPunchline}
                        onChange={(e) =>
                          setEditJoke({
                            ...editJoke,
                            formattedPunchline: e.target.value,
                          })
                        }
                      ></textarea>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className={`${inputStyles} w-full text-sm`}
                        value={editJoke.source}
                        onChange={(e) =>
                          setEditJoke({ ...editJoke, source: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition w-20"
                          onClick={saveEdit}
                          disabled={saving}
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          className="bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition w-20"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={joke.jokeId}
                    className="hover:bg-slate-700/40 transition"
                  >
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {joke.jokeId}
                    </td>
                    <td className="px-4 py-3">{joke.setup}</td>
                    <td className="px-4 py-3">{joke.punchline}</td>
                    <td className="px-4 py-3">{joke.formattedPunchline}</td>
                    <td className="px-4 py-3 text-slate-400">{joke.source}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition w-20"
                        onClick={() => startEdit(joke)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Jokes;
