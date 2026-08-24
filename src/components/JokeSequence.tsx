import React, { useEffect, useState } from "react";
import { LoginProps } from "../interfaces/LoginPropsInterface";

const JokeSequence: React.FC<LoginProps> = () => {
  const [sequence, setSequence] = useState(0);

  const updateSequence = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    if (!tokenString) {
      alert("Please log in again");
      return;
    }
    const { user, token } = JSON.parse(tokenString);
    const response = await fetch(
      "https://jokedle-api.cadegray.dev/joke/sequence",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User": user,
        },
        body: JSON.stringify({ sequenceNbr: sequence }),
      },
    );
    if (response.ok) {
      alert("Sequence updated");
    } else {
      alert("Error updating sequence");
    }
  };
  const getSequence = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    if (!tokenString) {
      alert("Please log in again");
      return;
    }
    const { user, token } = JSON.parse(tokenString);
    const response = await fetch(
      "https://jokedle-api.cadegray.dev/joke/sequence",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User": user,
        },
      },
    );
    const data = await response.json();
    setSequence(data?.sequenceNbr ?? data?.[0]?.sequenceNbr ?? 0);
  };
  useEffect(() => {
    getSequence();
  }, []); // Empty array ensures that effect is only run on mount
  return (
    <div className="flex justify-center flex-col bg-slate-800/60 border border-slate-700 m-3 sm:m-5 p-4 sm:p-6 rounded-xl shadow-lg">
      <h1 className="text-lg sm:text-xl font-mono text-center text-neutral-100">
        Joke Sequence
      </h1>
      <div className="flex justify-center gap-2 mt-4 sm:m-5">
        <input
          type="number"
          value={sequence}
          className="bg-slate-900/70 border border-slate-600 rounded-lg p-2 text-neutral-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition w-full min-w-0 max-w-[10rem]"
          onChange={(e) => setSequence(parseInt(e.target.value))}
        />
        <button
          className="bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg shadow-md transition px-4 py-2 w-32 shrink-0"
          onClick={() => updateSequence()}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default JokeSequence;
