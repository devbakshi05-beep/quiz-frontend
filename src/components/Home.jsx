import { useEffect, useState } from "react";
import { getCategories, getLeaderboard } from "../api.js";
import Leaderboard from "./Leaderboard.jsx";

export default function Home({ onStart, initialName }) {
  const [name, setName] = useState(initialName);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getCategories(), getLeaderboard()])
      .then(([cats, entries]) => {
        setCategories(cats);
        setBoard(entries.slice(0, 5));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const canStart = name.trim().length > 0 && selected;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canStart) onStart(name.trim(), selected);
  };

  return (
    <main className="home">
      <section className="home-hero">
        <h1>Quiz Arena</h1>
        <p className="lead">Pick a topic, beat the 20 second clock and climb the leaderboard.</p>

        <div className="hero-board">
          <h2>Top scores</h2>
          <Leaderboard entries={board} showCategory />
        </div>
      </section>

      <section className="home-form">
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Type your name"
              autoFocus
            />
          </label>

          <h2 className="section-title">Choose a quiz</h2>

          {loading && <p className="muted">Loading quizzes...</p>}
          {error && <p className="alert" role="alert">{error}</p>}

          <div className="category-list" role="radiogroup" aria-label="Quiz category">
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                role="radio"
                aria-checked={selected?.id === c.id}
                className={`category ${selected?.id === c.id ? "is-selected" : ""}`}
                onClick={() => setSelected(c)}
              >
                <strong>{c.name}</strong>
                <span>{c.description}</span>
                <small>{c.questionCount} questions</small>
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-wide" disabled={!canStart}>
            Start quiz
          </button>
        </form>
      </section>
    </main>
  );
}
