import { useCallback, useEffect, useRef, useState } from "react";
import { getQuestions, submitQuiz } from "../api.js";

const SECONDS_PER_QUESTION = 20;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

function TimerRing({ timeLeft }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(timeLeft, 0) / SECONDS_PER_QUESTION);
  return (
    <div className={`timer ${timeLeft <= 5 ? "is-low" : ""}`} role="timer" aria-label={`${timeLeft} seconds left`}>
      <svg viewBox="0 0 64 64" width="64" height="64">
        <circle className="timer-track" cx="32" cy="32" r={radius} />
        <circle
          className="timer-bar"
          cx="32"
          cy="32"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span>{Math.max(timeLeft, 0)}</span>
    </div>
  );
}

export default function Quiz({ player, onFinish, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionId, selectedIndex }]
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());
  const pendingAnswers = useRef([]);

  // 1) Questions backend se lao
  useEffect(() => {
    getQuestions(player.category.id)
      .then((data) => {
        setQuestions(data);
        startedAt.current = Date.now();
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [player.category.id]);

  // 2) Saare answers backend ko bhejo, score wahan calculate hota hai
  const submit = useCallback(
    async (finalAnswers) => {
      pendingAnswers.current = finalAnswers;
      setSubmitting(true);
      setError("");
      try {
        const result = await submitQuiz({
          playerName: player.name,
          categoryId: player.category.id,
          answers: finalAnswers,
          timeTakenSeconds: Math.round((Date.now() - startedAt.current) / 1000)
        });
        onFinish(result);
      } catch (e) {
        setError(e.message);
      }
    },
    [player, onFinish]
  );

  // 3) Next question ya quiz ka end
  const advance = useCallback(
    (choice) => {
      const question = questions[index];
      const updated = [...answers, { questionId: question.id, selectedIndex: choice }];
      setAnswers(updated);

      if (index + 1 < questions.length) {
        setIndex(index + 1);
        setSelected(null);
        setTimeLeft(SECONDS_PER_QUESTION);
      } else {
        submit(updated);
      }
    },
    [questions, index, answers, submit]
  );

  // Timer callback ko hamesha latest advance chahiye
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // 4) Har second timer ghatao
  const running = questions.length > 0 && !submitting && !error;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [running, index]);

  // 5) Time khatam hone pe jo option select tha wahi jaye (ya skip)
  useEffect(() => {
    if (running && timeLeft <= 0) advanceRef.current(selected);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // 6) Keyboard: A-D ya 1-4 se option, Enter se next
  useEffect(() => {
    const onKey = (e) => {
      if (!running) return;
      const q = questions[index];
      const key = e.key.toLowerCase();
      const byLetter = ["a", "b", "c", "d", "e", "f"].indexOf(key);
      const byNumber = Number(key) - 1;
      const pick = byLetter >= 0 ? byLetter : byNumber;
      if (Number.isInteger(pick) && pick >= 0 && pick < q.options.length) setSelected(pick);
      // Focused button pe Enter already click ho jata hai, isliye double advance se bachne ke liye skip
      if (key === "enter" && selected !== null && e.target.tagName !== "BUTTON") advanceRef.current(selected);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, questions, index, selected]);

  if (loading) {
    return <main className="quiz"><p className="muted center">Loading questions...</p></main>;
  }

  if (error && questions.length === 0) {
    return (
      <main className="quiz">
        <p className="alert" role="alert">{error}</p>
        <button className="btn btn-ghost" onClick={onExit}>Back to home</button>
      </main>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  return (
    <main className="quiz">
      <header className="quiz-top">
        <div>
          <strong>{player.category.name}</strong>
          <span className="muted"> · Question {index + 1} of {questions.length}</span>
        </div>
        <button className="btn btn-ghost" onClick={onExit}>Quit</button>
      </header>

      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <section className="question-card">
        <div className="question-head">
          <h2>{question.text}</h2>
          <TimerRing timeLeft={timeLeft} />
        </div>

        <div className="options" role="radiogroup" aria-label="Answer options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={selected === i}
              className={`option ${selected === i ? "is-selected" : ""}`}
              onClick={() => setSelected(i)}
              disabled={submitting}
            >
              <kbd>{LETTERS[i]}</kbd>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="alert" role="alert">
            {error}{" "}
            <button className="link" onClick={() => submit(pendingAnswers.current)}>Try again</button>
          </div>
        )}

        <footer className="question-foot">
          <span className="muted">Pick with A to D or 1 to 4, press Enter to continue.</span>
          <button
            className="btn btn-primary"
            disabled={selected === null || submitting}
            onClick={() => advance(selected)}
          >
            {submitting ? "Checking answers..." : isLast ? "Finish quiz" : "Next question"}
          </button>
        </footer>
      </section>
    </main>
  );
}
