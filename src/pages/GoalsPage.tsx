import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Goal {
  id: number;
  text: string;
  type: "time" | "books";
  target: number;
  daily: boolean;
  completed: boolean;
  progress: number;
}

const GoalsPage = () => {
  const [goalText, setGoalText] = useState<string>("");
  const [goalType, setGoalType] = useState<"time" | "books">("time");
  const [goalTarget, setGoalTarget] = useState<number>(0);
  const [isDaily, setIsDaily] = useState<boolean>(false);
  const [goalsList, setGoalsList] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem("goals");
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  const navigate = useNavigate();

  const totalReadingTime = Number(localStorage.getItem("totalReadingTime") || 0);
  const completedBooks = JSON.parse(localStorage.getItem("readingProgress") || "[]").filter(
    (b: { pagesRead: number; totalPages: number }) => b.pagesRead >= (b.totalPages || Infinity)
  ).length;

  const today = new Date().toDateString();
  const [dailyReadingTime, setDailyReadingTime] = useState<number>(() => {
    const savedDaily = localStorage.getItem(`dailyReadingTime_${today}`);
    return savedDaily ? Number(savedDaily) : 0;
  });

  // Синхронизация ежедневного времени чтения
  const syncDailyTime = () => {
    const savedSessions = JSON.parse(localStorage.getItem("readingSessions") || "[]");
    const todaySession = savedSessions.find((s: { date: string }) => s.date === today);
    const todayMinutes = todaySession ? todaySession.minutes : 0;
    setDailyReadingTime(todayMinutes * 60); // Переводим минуты в секунды
  };

  useEffect(() => {
    syncDailyTime(); // Synchronize daily reading time
    localStorage.setItem(`dailyReadingTime_${today}`, dailyReadingTime.toString());
    localStorage.setItem("goals", JSON.stringify(goalsList));

    const updatedGoals = goalsList.map((g) => {
      const progress =
        g.type === "time"
          ? g.daily
            ? dailyReadingTime / 60 // Minutes for the day
            : Math.floor(totalReadingTime / 60) // Total time
          : completedBooks;
      return {
        ...g,
        progress,
        completed: progress >= g.target,
      };
    });
    setGoalsList(updatedGoals);
  }, [dailyReadingTime, totalReadingTime, completedBooks, today]); // Include dailyReadingTime in dependencies

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => setGoalText(e.target.value);
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => setGoalTarget(Number(e.target.value));
  const handleSaveGoal = () => {
    if (goalText.trim() && goalTarget > 0) {
      setGoalsList([
        ...goalsList,
        { id: Date.now(), text: goalText, type: goalType, target: goalTarget, daily: isDaily, completed: false, progress: 0 },
      ]);
      setGoalText("");
      setGoalTarget(0);
      setIsDaily(false);
      alert(`Goal saved: ${goalText}`);
    } else {
      alert("Please enter a goal and a valid target!");
    }
  };
  const toggleGoalCompletion = (id: number) => {
    setGoalsList(goalsList.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };
  const deleteGoal = (id: number) => setGoalsList(goalsList.filter((g) => g.id !== id));

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 min-h-screen flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <button
          onClick={() => navigate("/")}
          className="mb-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:from-teal-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105"
        >
          Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Set Your Reading Goals</h1>
        <div className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            value={goalText}
            onChange={handleGoalChange}
            className="bg-gray-100 text-gray-800 px-6 py-4 rounded-lg text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full"
            placeholder="E.g., Read daily"
          />
          <div className="flex gap-4 items-center">
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as "time" | "books")}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="time">Time (minutes)</option>
              <option value="books">Books</option>
            </select>
            <input
              type="number"
              value={goalTarget}
              onChange={handleTargetChange}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400 w-20"
              placeholder="Target"
              min="1"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                className="form-checkbox h-5 w-5 text-teal-500"
              />
              <span className="text-gray-700">Daily</span>
            </label>
            <button
              onClick={handleSaveGoal}
              className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-6 py-4 rounded-lg font-medium shadow-md hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 transform hover:scale-105"
            >
              Save Goal
            </button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Goals</h2>
          {goalsList.length > 0 ? (
            <ul className="space-y-4">
              {goalsList.map((g) => (
                <li
                  key={g.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    g.completed ? "bg-gradient-to-r from-emerald-100 to-teal-100" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${g.completed ? "bg-teal-400" : "bg-gray-400"}`} />
                    <div>
                      <p className={`text-gray-800 ${g.completed ? "line-through" : ""}`}>
                        {g.text} ({g.daily ? "Daily" : "Total"})
                      </p>
                      <p className="text-sm text-gray-600">
                        {g.progress}/{g.target} {g.type === "time" ? "minutes" : "books"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleGoalCompletion(g.id)}
                      className="text-sm text-gray-600 hover:text-teal-500 transition-colors duration-200"
                    >
                      {g.completed ? "Undo" : "Complete"}
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="bg-gradient-to-r from-red-400 to-rose-400 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md hover:from-red-300 hover:to-rose-300 transition-all duration-300 transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No goals yet. Add some to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;