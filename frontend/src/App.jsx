import React, { useState } from "react";
import { Header } from "./components/Header";
import { HustleForm } from "./components/HustleForm";
import { Result } from "./components/Result";
import "./App.css";

function App() {
  const [hustleIdeas, setHustleIdeas] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setHustleIdeas(data.ideas);
    setLoading(false);
  };

  return (
    <div className="app">
      <Header />
      <HustleForm onSubmit={handleSubmit} loading={loading} />
      {hustleIdeas && <Result ideas={hustleIdeas} />}
    </div>
  );
}

export default App;
