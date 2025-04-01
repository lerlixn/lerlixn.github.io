import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-green-50 via-lime-50 to-purple-50 min-h-screen flex flex-col items-center p-6 text-gray-800 relative">
      {/* Логотип и кнопка отзывов в верхней части */}
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <div className="bg-white/50 rounded-full p-3 shadow-md">
          <img
            src={require("../assets/logo.png")}
            alt="ReadTimer Logo"
            className="h-20"
          />
        </div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScWBtI562YEORBjR8kfVchUEaSqxeTCrZyVVwGZTWmNc_qv1w/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-purple-300 hover:to-pink-300 transition-all duration-300 transform hover:scale-105"
        >
          Leave Feedback
        </a>
      </div>

      {/* Верхняя секция с кнопками навигации */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full max-w-2xl mb-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Welcome to ReadTimer
        </h1>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/timer")}
            className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-green-300 hover:to-emerald-300 transition-all duration-300 transform hover:scale-105"
          >
            Start Reading
          </button>
          <button
            onClick={() => navigate("/books")}
            className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-blue-300 hover:to-indigo-300 transition-all duration-300 transform hover:scale-105"
          >
            View Books
          </button>
        </div>
      </div>

      {/* Секция с информацией о приложении */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full max-w-4xl mb-10">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-900">
          About ReadTimer
        </h2>
        <h3 className="text-xl font-semibold mb-6 text-center text-gray-700">
          Your Ultimate Reading Companion
        </h3>
        <p className="text-gray-700 mb-8 text-center">
          ReadTimer is designed to make your reading experience more organized and enjoyable. Whether you're diving into a novel, studying for school, or exploring new genres, ReadTimer helps you stay focused, track your progress, and keep your thoughts in one place. Here's how it works:
        </p>

        {/* Список функций с иконками */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-3 text-emerald-400">⏳</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Read with a Timer
            </h4>
            <p className="text-gray-700">
              Set a timer to read without distractions. Use the Pomodoro technique to stay focused and take breaks when needed.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-3 text-emerald-400">📚</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Your Books
            </h4>
            <p className="text-gray-700">
              Add books using Google Books search, track your reading progress with a progress bar, and edit details anytime.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-3 text-emerald-400">📝</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Keep Your Notes
            </h4>
            <p className="text-gray-700">
              Write notes after each session. They'll be added to your existing notes, so you never lose your thoughts.
            </p>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Why Choose ReadTimer?
          </h4>
          <p className="text-gray-700 mb-4">
            Reading can be more than just a hobby — it's a way to grow, learn, and relax. ReadTimer helps you build a reading habit by making it easy to stay consistent. With features like progress tracking, note-taking, and a clean interface, you'll always know where you left off and what you thought about each book.
          </p>
          <p className="text-gray-700">
            Perfect for book lovers, students, or anyone who wants to read more. Start your reading journey today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;