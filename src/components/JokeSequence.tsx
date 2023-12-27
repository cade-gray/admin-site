import React, { useEffect, useState } from "react";
import { LoginProps } from "../interfaces/LoginPropsInterface";

const JokeSequence: React.FC<LoginProps> = () => {
  const [sequence, setSequence] = useState(0);

  const updateSequence = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    const response = await fetch("http://localhost:3030/joke/updatesequence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user, sequenceNbr: sequence }),
    });
    if (response.ok) {
      alert("Sequence updated");
    } else {
      alert("Error updating sequence");
    }
  };
  const getSequence = async () => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    const response = await fetch("http://localhost:3030/joke/getsequence", {
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
    <div className="flex justify-center flex-col bg-slate-300 m-5 p-5 rounded-md">
      <h1 className="text-3xl font-bold text-center text-neutral-700">
        Joke Sequence
      </h1>
      <div className="flex justify-center space-x-2 m-5">
        <input
          type="number"
          value={sequence}
          className="bg-neutral-700 text-neutral-200 p-2 rounded-md"
          onChange={(e) => setSequence(parseInt(e.target.value))}
        />
        <button
          className="bg-sky-500 rounded-md shadow-lg hover:scale-110 w-32"
          onClick={() => updateSequence()}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default JokeSequence;
