export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// entries: backend se aayi leaderboard list
export default function Leaderboard({ entries, showCategory = false, highlightName = "" }) {
  if (!entries || entries.length === 0) {
    return <p className="empty">No scores yet. Finish a quiz to take the first spot.</p>;
  }

  return (
    <ol className="board">
      {entries.map((e, i) => (
        <li
          key={`${e.playerName}-${e.playedAt}`}
          className={`board-row ${highlightName && e.playerName === highlightName ? "is-you" : ""}`}
        >
          <span className="board-rank">{i + 1}</span>
          <span className="board-name">
            {e.playerName}
            {showCategory && <small>{e.categoryName}</small>}
          </span>
          <span className="board-score">
            {e.score}/{e.total}
          </span>
          <span className="board-time">{formatTime(e.timeTakenSeconds)}</span>
        </li>
      ))}
    </ol>
  );
}
