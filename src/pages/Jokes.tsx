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

interface JokeSubmission {
  submissionId: number;
  setup: string;
  punchline: string;
  source?: string;
  createdAt?: string;
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
  const [source, setSource] = useState("");
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [submissions, setSubmissions] = useState<JokeSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadedSubmissionId, setLoadedSubmissionId] = useState<number | null>(
    null,
  );
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
    if (!tokenString) {
      setLoggedIn(false);
      return;
    }
    const { user, token } = JSON.parse(tokenString);
    // Fetch users from API
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://jokedle-api.cadegray.dev/joke/all",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-User": user,
            },
          },
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
          setJokes(data);
        }
      } catch (error) {
        alert("Error pulling all jokes: " + error);
      }
    };
    fetchData();
  };

  const fetchSubmissions = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    if (!tokenString) {
      setLoggedIn(false);
      return;
    }
    const { user, token } = JSON.parse(tokenString);
    setSubmissionsLoading(true);
    try {
      const response = await fetch(
        "https://jokedle-api.cadegray.dev/joke/submission/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User": user,
          },
        },
      );
      if (!response.ok) {
        if (response.status === 401) {
          logoutPost();
          sessionStorage.removeItem("cg-admin-token"); // Remove token since it does not exist in database
          setLoggedIn(false);
        }
        return;
      }
      const data = await response.json();
      setSubmissions(data ?? []);
    } catch (error) {
      alert("Error pulling joke submissions: " + error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const deleteSubmission = async (submission: JokeSubmission) => {
    if (
      !window.confirm(
        `Delete submission #${submission.submissionId}? This cannot be undone.`,
      )
    ) {
      return;
    }
    const tokenString = sessionStorage.getItem("cg-admin-token");
    if (!tokenString) {
      setLoggedIn(false);
      return;
    }
    const { user, token } = JSON.parse(tokenString);
    setDeletingId(submission.submissionId);
    try {
      const response = await fetch(
        `https://jokedle-api.cadegray.dev/joke/submission/${submission.submissionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User": user,
          },
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
        setSubmissions((current) =>
          current.filter(
            (item) => item.submissionId !== submission.submissionId,
          ),
        );
      } else {
        alert("Error deleting submission: " + (data.error ?? response.status));
      }
    } catch (error) {
      alert("Error deleting submission: " + error);
    } finally {
      setDeletingId(null);
    }
  };

  const clearForm = () => {
    setSetup("");
    setPunchline("");
    setFormattedPunchline("");
    setSource("");
    setLoadedSubmissionId(null);
  };

  // Loads a public submission into the new-joke form so it can be tweaked
  // before being added to the main joke database
  const loadSubmission = (submission: JokeSubmission) => {
    cancelEdit();
    setSetup(submission.setup ?? "");
    setPunchline(submission.punchline ?? "");
    setFormattedPunchline(submission.punchline ?? "");
    setSource(submission.source ?? "");
    setLoadedSubmissionId(submission.submissionId);
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
    fetchSubmissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="text-neutral-200 max-w-5xl mx-auto pb-10">
      <h1 className="text-3xl font-mono m-3 text-neutral-100">
        Jokedle Administration
      </h1>
      <div className="m-5 bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-xl font-mono text-neutral-100">
            Public Joke Submissions
          </h2>
          <button
            className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
            onClick={fetchSubmissions}
            disabled={submissionsLoading}
          >
            {submissionsLoading ? "Loading…" : "Refresh"}
          </button>
        </div>
        {submissions.length === 0 ? (
          <p className="px-5 pb-4 text-sm text-slate-400">
            {submissionsLoading
              ? "Loading submissions…"
              : "No submissions right now."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Setup</th>
                  <th className="px-4 py-3">Punchline</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {submissions.map((submission) => (
                  <tr
                    key={submission.submissionId}
                    className={`transition ${
                      loadedSubmissionId === submission.submissionId
                        ? "bg-slate-700/40"
                        : "hover:bg-slate-700/40"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {submission.submissionId}
                    </td>
                    <td className="px-4 py-3">{submission.setup}</td>
                    <td className="px-4 py-3">{submission.punchline}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {submission.source}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition w-20"
                          onClick={() => loadSubmission(submission)}
                          disabled={deletingId === submission.submissionId}
                        >
                          Load
                        </button>
                        <button
                          className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition w-20"
                          onClick={() => deleteSubmission(submission)}
                          disabled={deletingId === submission.submissionId}
                        >
                          {deletingId === submission.submissionId
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
            const pulledJoke = data?.joke ?? data;

            if (!pulledJoke?.setup || !pulledJoke?.punchline) {
              alert("Error pulling joke: unexpected API response");
              return;
            }

            setSetup(pulledJoke.setup);
            setPunchline(pulledJoke.punchline);
            setFormattedPunchline(
              pulledJoke.formattedPunchline ?? pulledJoke.punchline,
            );
            setSource(pulledJoke.source ?? "");
            setLoadedSubmissionId(null);
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
        <label className="flex flex-col gap-1 text-sm text-slate-400 w-full">
          Source
          <input
            type="text"
            className={inputStyles}
            placeholder="Source (optional)"
            maxLength={45}
            onChange={(event) => setSource(event.target.value)}
            value={source}
          />
        </label>
        <div className="w-full">
          <p className="text-sm text-slate-400 mb-1 text-center">
            Grid Preview{" "}
            {editingId !== null && (
              <span className="text-amber-400">— editing joke #{editingId}</span>
            )}
            {editingId === null && loadedSubmissionId !== null && (
              <span className="text-amber-400">
                — from submission #{loadedSubmissionId}
              </span>
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
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium p-2 rounded-lg shadow-md transition w-64"
            onClick={async () => {
              // TODO: Seperate this into a function and place in lib folder
              const joke = {
                setup: setup,
                punchline: punchline,
                formattedPunchline: formattedPunchline,
                source: source || null,
              };
              const tokenString = sessionStorage.getItem("cg-admin-token");
              if (!tokenString) {
                setLoggedIn(false);
                return;
              }
              const { user, token } = JSON.parse(tokenString);
              const response = await fetch(
                "https://jokedle-api.cadegray.dev/joke",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-User": user,
                  },
                  body: JSON.stringify({ joke }),
                },
              );

              const data = await response.json();
              if (data.success) {
                clearForm();
                fetchJokes();
              } else {
                alert("Error submitting joke: " + data.error);
              }
            }}
          >
            Submit Joke to Database
          </button>
          <button
            className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 text-white font-medium p-2 rounded-lg shadow-md transition w-40"
            onClick={clearForm}
            disabled={!setup && !punchline && !formattedPunchline && !source}
          >
            Clear Fields
          </button>
        </div>
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
