import { useState } from "react";
import Home from "./components/Home.jsx";
import Quiz from "./components/Quiz.jsx";
import Result from "./components/Result.jsx";

// Teen screens: "home" -> "quiz" -> "result"
export default function App() {
  const [screen, setScreen] = useState("home");
  const [player, setPlayer] = useState(null); // { name, category }
  const [result, setResult] = useState(null);
  const [runId, setRunId] = useState(0); // har naye attempt pe badalta hai, taki Quiz fresh start ho

  const startQuiz = (name, category) => {
    setPlayer({ name, category });
    setResult(null);
    setRunId((n) => n + 1);
    setScreen("quiz");
  };

  const finishQuiz = (data) => {
    setResult(data);
    setScreen("result");
  };

  return (
    <>
      {screen === "home" && <Home onStart={startQuiz} initialName={player?.name ?? ""} />}
      {screen === "quiz" && (
        <Quiz key={runId} player={player} onFinish={finishQuiz} onExit={() => setScreen("home")} />
      )}
      {screen === "result" && (
        <Result
          result={result}
          onPlayAgain={() => startQuiz(player.name, player.category)}
          onHome={() => setScreen("home")}
        />
      )}
    </>
  );
}
