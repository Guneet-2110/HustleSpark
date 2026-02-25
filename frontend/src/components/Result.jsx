import React from "react";

export const Result = ({ ideas }) => (
  <section className="results">
    <h2>Here are your hustle ideas:</h2>
    <ul>
      {ideas.map((idea, index) => (
        <li key={index}>{idea}</li>
      ))}
    </ul>
  </section>
);
