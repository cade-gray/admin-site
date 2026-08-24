/*
 * Jokes.tsx
 * Page for adding and updating jokes in the database
 * Created by Cade Gray
 * TODO: Add a history of jokes pulled from API during session.
 * TODO: Move joke pulling and submission to a component. Functions to be placed in lib folder.
 */
import { useEffect, useRef, useState } from "react";
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

const inputStyles =
  "bg-slate-900/70 border border-slate-600 rounded-lg p-2 text-neutral-200 placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition";

const cardStyles =
  "bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg m-3 sm:m-5";

// Below md the tables reflow into stacked cards: the header row is hidden and
// each cell prints its own label from data-label, so nothing scrolls sideways
const tableStyles = "w-full text-left text-sm";
const theadStyles =
  "hidden md:table-header-group bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider";
const tbodyStyles = "block md:table-row-group divide-y divide-slate-700";
const rowStyles = "block md:table-row py-2 md:py-0 transition";
const cellStyles =
  "block md:table-cell align-top px-4 py-1.5 md:py-3 before:block before:text-xs before:uppercase before:tracking-wider before:text-slate-500 before:content-[attr(data-label)] md:before:content-none";

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
  // editingId null means the form is composing a new joke, otherwise it is
  // editing that existing joke in place
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSetupChange = (event) => {
    setSetup(event.target.value);
  };
  const handlePunchlineChange = (event) => {
    setPunchline(event.target.value);
    // Mirroring is a convenience for new jokes - never clobber the hand
    // formatted punchline of a joke that is already in the database
    if (editingId === null) {
      setFormattedPunchline(event.target.value);
    }
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

  const submitNewJoke = async () => {
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
    const response = await fetch("https://jokedle-api.cadegray.dev/joke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User": user,
      },
      body: JSON.stringify({ joke }),
    });

    const data = await response.json();
    if (data.success) {
      clearForm();
      fetchJokes();
    } else {
      alert("Error submitting joke: " + data.error);
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
    setEditingId(null);
    setSetup(submission.setup ?? "");
    setPunchline(submission.punchline ?? "");
    setFormattedPunchline(submission.punchline ?? "");
    setSource(submission.source ?? "");
    setLoadedSubmissionId(submission.submissionId);
  };

  // Pulls an existing joke up into the main form so it can be edited with the
  // full width fields and the grid preview
  const startEdit = (joke: Joke) => {
    setEditingId(joke.jokeId);
    setLoadedSubmissionId(null);
    setSetup(joke.setup ?? "");
    setPunchline(joke.punchline ?? "");
    setFormattedPunchline(joke.formattedPunchline ?? joke.punchline ?? "");
    setSource(joke.source ?? "");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearForm();
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
          body: JSON.stringify({
            joke: {
              setup,
              punchline,
              formattedPunchline,
              source: source || null,
            },
          }),
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
      <h1 className="text-2xl sm:text-3xl font-mono m-3 text-neutral-100">
        Jokedle Administration
      </h1>
      <div className={`${cardStyles} overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-2">
          <h2 className="text-lg sm:text-xl font-mono text-neutral-100">
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
          <p className="px-4 sm:px-5 pb-4 text-sm text-slate-400">
            {submissionsLoading
              ? "Loading submissions…"
              : "No submissions right now."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableStyles}>
              <thead className={theadStyles}>
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Setup</th>
                  <th className="px-4 py-3">Punchline</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={tbodyStyles}>
                {submissions.map((submission) => (
                  <tr
                    key={submission.submissionId}
                    className={`${rowStyles} ${
                      loadedSubmissionId === submission.submissionId
                        ? "bg-slate-700/40"
                        : "hover:bg-slate-700/40"
                    }`}
                  >
                    <td
                      data-label="ID"
                      className={`${cellStyles} font-mono text-slate-400`}
                    >
                      {submission.submissionId}
                    </td>
                    <td data-label="Setup" className={cellStyles}>
                      {submission.setup}
                    </td>
                    <td data-label="Punchline" className={cellStyles}>
                      {submission.punchline}
                    </td>
                    <td
                      data-label="Source"
                      className={`${cellStyles} text-slate-400`}
                    >
                      {submission.source}
                    </td>
                    <td
                      data-label="Submitted"
                      className={`${cellStyles} text-slate-400 md:whitespace-nowrap`}
                    >
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleDateString()
                        : ""}
                    </td>
                    <td className={`${cellStyles} pt-2 md:pt-3`}>
                      <div className="flex gap-2 md:justify-end">
                        <button
                          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 md:py-1.5 rounded-lg transition w-full md:w-20"
                          onClick={() => loadSubmission(submission)}
                          disabled={deletingId === submission.submissionId}
                        >
                          Load
                        </button>
                        <button
                          className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 md:py-1.5 rounded-lg transition w-full md:w-20"
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
      <div
        ref={formRef}
        className={`${cardStyles} flex flex-col space-y-5 items-center p-4 sm:p-6 ${
          editingId !== null ? "ring-1 ring-amber-500/60" : ""
        }`}
      >
        <button
          className="bg-sky-500 hover:bg-sky-400 text-white font-medium p-2 rounded-lg shadow-md transition w-full sm:w-64"
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
            {Array.from(formattedPunchline, (char, index) => (
              <div
                key={index}
                className={`m-px sm:m-0.5 aspect-square flex items-center justify-center text-[0.6rem] sm:text-base md:text-xl font-semibold rounded ${
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
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center w-full">
          {editingId !== null ? (
            <>
              <button
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium p-2 rounded-lg shadow-md transition w-full sm:w-64"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? "Saving…" : `Save Changes to #${editingId}`}
              </button>
              <button
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 text-white font-medium p-2 rounded-lg shadow-md transition w-full sm:w-40"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel Edit
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium p-2 rounded-lg shadow-md transition w-full sm:w-64"
                onClick={submitNewJoke}
              >
                Submit Joke to Database
              </button>
              <button
                className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 text-white font-medium p-2 rounded-lg shadow-md transition w-full sm:w-40"
                onClick={clearForm}
                disabled={
                  !setup && !punchline && !formattedPunchline && !source
                }
              >
                Clear Fields
              </button>
            </>
          )}
        </div>
      </div>
      <JokeSequence
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        username={username}
        setUsername={setUsername}
      />
      <div className={`${cardStyles} overflow-hidden`}>
        <h2 className="text-lg sm:text-xl font-mono text-neutral-100 px-4 sm:px-5 pt-4 pb-2">
          Joke Database
        </h2>
        <div className="overflow-x-auto">
          <table className={tableStyles}>
            <thead className={theadStyles}>
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Setup</th>
                <th className="px-4 py-3">Punchline</th>
                <th className="px-4 py-3">Formatted Punchline</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={tbodyStyles}>
              {jokes.map((joke) => (
                <tr
                  key={joke.jokeId}
                  className={`${rowStyles} ${
                    editingId === joke.jokeId
                      ? "bg-slate-700/40"
                      : "hover:bg-slate-700/40"
                  }`}
                >
                  <td
                    data-label="ID"
                    className={`${cellStyles} font-mono text-slate-400`}
                  >
                    {joke.jokeId}
                  </td>
                  <td data-label="Setup" className={cellStyles}>
                    {joke.setup}
                  </td>
                  <td data-label="Punchline" className={cellStyles}>
                    {joke.punchline}
                  </td>
                  <td data-label="Formatted Punchline" className={cellStyles}>
                    {joke.formattedPunchline}
                  </td>
                  <td
                    data-label="Source"
                    className={`${cellStyles} text-slate-400`}
                  >
                    {joke.source}
                  </td>
                  <td className={`${cellStyles} pt-2 md:pt-3 md:text-right`}>
                    <button
                      className="bg-sky-500 hover:bg-sky-400 disabled:bg-amber-500 disabled:opacity-100 text-white text-xs font-medium px-3 py-2 md:py-1.5 rounded-lg transition w-full md:w-20"
                      onClick={() => startEdit(joke)}
                      disabled={editingId === joke.jokeId}
                    >
                      {editingId === joke.jokeId ? "Editing" : "Edit"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Jokes;
