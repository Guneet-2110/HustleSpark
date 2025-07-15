import React, { useState } from "react";

export const HustleForm = ({ onSubmit, loading }) => {
  const [interests, setInterests] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ interests });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>What are you into?</label>
      <input
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="e.g. design, pets, tech"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Hustles"}
      </button>
    </form>
  );
};
