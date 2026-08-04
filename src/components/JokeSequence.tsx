import React, { useEffect, useState } from "react";
import { LoginProps } from "../interfaces/LoginPropsInterface";

const JokeSequence: React.FC<LoginProps> = () => {
  const [sequence, setSequence] = useState(0);

  const updateSequence = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    const response = await fetch(
      "https://api.cadegray.dev/joke/updatesequence",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user, sequenceNbr: sequence }),
      }
    );
    if (response.ok) {
      alert("Sequence updated");
    } else {
      alert("Error updating sequence");
    }
  };
  const getSequence = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    const response = await fetch("https://api.cadegray.dev/joke/getsequence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user }),
    });
    const data = await response.json();
    setSequence(data[0].sequenceNbr);
  };
  useEffect(() => {
    getSequence();
  }, []); // Empty array ensures that effect is only run on mount
  return (
    <div className="flex justify-center flex-col bg-slate-800/60 border border-slate-700 m-5 p-6 rounded-xl shadow-lg">
      <h1 className="text-xl font-mono text-center text-neutral-100">
        Joke Sequence
      </h1>
      <div className="flex justify-center space-x-2 m-5">
        <input
          type="number"
          value={sequence}
          className="bg-slate-900/70 border border-slate-600 rounded-lg p-2 text-neutral-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          onChange={(e) => setSequence(parseInt(e.target.value))}
        />
        <button
          className="bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg shadow-md transition w-32"
          onClick={() => updateSequence()}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default JokeSequence;
