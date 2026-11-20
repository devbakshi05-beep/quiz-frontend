import { useEffect, useState } from "react";
import { getLeaderboard } from "../api.js";
import Leaderboard, { formatTime } from "./Leaderboard.jsx";

function verdict(p) {
  if (p === 100) return "Perfect score. Nothing slipped past you.";
  if (p >= 75) return "Strong round. A little revision and you will ace it.";
  if (p >= 50) return "Decent start. Check the review below and try again.";
  return "Tough one. The review below shows what to brush up on.";
}

export default function Result({ result, onPlayAgain, onHome }) {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    getLeaderboard(result.categoryId).then((d) => setBoard(d.slice(0, 5))).catch(() => {});
  }, [result.categoryId]);

  return (
    <main className="result">
      <section className="result-summary">
        <div className="score-circle" style={{ "--pct": result.percentage }}>
          <div>
            <strong>{result.score}</strong>
            <span>out of {result.total}</span>
          </div>
        </div>
        <div>
          <h1>{result.playerName}, you scored {result.percentage}%</h1>
          <p className="lead">{verdict(result.percentage)}</p>
          <p className="muted">
            {result.categoryName} · finished in {formatTime(result.timeTakenSeconds)} · rank {result.rank} on this quiz
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={onPlayAgain}>Play again</button>
            <button className="btn btn-ghost" onClick={onHome}>Choose another quiz</button>
          </div>
        </div>
      </section>

      <div className="result-grid">
        <section>
          <h2 className="section-title">Review your answers</h2>
          <ul className="review">
            {result.review.map((r, i) => (
              <li key={r.questionId} className={r.isCorrect ? "is-correct" : "is-wrong"}>
                <p className="review-q">{i + 1}. {r.text}</p>
                <p className="review-a">
                  <b>{r.isCorrect ? "Correct" : "Incorrect"}.</b>{" "}
                  {r.selectedIndex === null || r.selectedIndex === undefined
                    ? "You did not answer this one."
                    : `You chose ${r.options[r.selectedIndex]}.`}
                  {!r.isCorrect && <> Right answer: {r.options[r.correctIndex]}.</>}
                </p>
                <p className="review-note">{r.explanation}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside>
          <h2 className="section-title">Leaderboard for this quiz</h2>
          <Leaderboard entries={board} highlightName={result.playerName} />
        </aside>
      </div>
    </main>
  );
}
