// Saari API calls ek hi jagah. Backend address .env file se aata hai.
const BASE = import.meta.env.VITE_API_URL || "https://quiz-api-2uew.onrender.com";

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  } catch {
    throw new Error("Can't reach the quiz server. Start the .NET API on port 5080 and try again.");
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data.message) message = data.message;
    } catch {
      /* response mein JSON nahi tha, default message chalega */
    }
    throw new Error(message);
  }
  return res.json();
}

export const getCategories = () => request("/api/quiz/categories");
export const getQuestions = (categoryId) => request(`/api/quiz/${categoryId}/questions`);
export const submitQuiz = (payload) =>
  request("/api/quiz/submit", { method: "POST", body: JSON.stringify(payload) });
export const getLeaderboard = (categoryId) =>
  request(`/api/quiz/leaderboard${categoryId ? `?categoryId=${categoryId}` : ""}`);
