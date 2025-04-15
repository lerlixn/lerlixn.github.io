import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ThemeToggle from "../components/ThemeToggle";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const buttonBaseClasses =
    "p-5 rounded-lg font-medium shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col items-center justify-center text-white w-full md:flex-1";

  const timerButtonClasses = `
    ${buttonBaseClasses}
    bg-gradient-to-r
    from-green-400 to-emerald-500 
    hover:from-green-300 hover:to-emerald-400
    dark:from-green-600 dark:to-emerald-700
    dark:hover:from-green-500 dark:hover:to-emerald-600
  `;

  const booksButtonClasses = `
    ${buttonBaseClasses}
    bg-gradient-to-r
    from-blue-400 to-indigo-500
    hover:from-blue-300 hover:to-indigo-400
    dark:from-blue-600 dark:to-indigo-700
    dark:hover:from-blue-500 dark:hover:to-indigo-600
  `;

  const feedbackLinkClasses = `
    ${buttonBaseClasses}
    bg-gradient-to-r
    from-purple-400 to-pink-500
    hover:from-purple-300 hover:to-pink-400
    dark:from-purple-600 dark:to-pink-700
    dark:hover:from-purple-500 dark:hover:to-pink-600
  `;

  const iconClasses = "text-3xl mb-2";
  const textClasses = "text-base text-center";

  return (
    <div className="bg-gradient-to-br from-green-50 via-lime-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black min-h-screen flex flex-col items-center p-8 text-gray-800 dark:text-gray-100 relative">
      <ThemeToggle />

      {/* Верхняя секция */}
      <div className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-lg p-12 w-full max-w-2xl mb-10 flex flex-col items-center">
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="bg-white/30 dark:bg-gray-700 backdrop-blur-lg rounded-full p-5 shadow-lg border border-white/40 overflow-hidden">
            <img
              src={logo}
              alt="ReadTimer Logo"
              className="h-28 sm:h-32 transition-all duration-300 rounded-full select-none pointer-events-none"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white">
          Welcome to ReadTimer
        </h1>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl justify-center">
          <button onClick={() => navigate("/timer")} className={timerButtonClasses}>
            <span className={iconClasses}>📖</span>
            <span className={textClasses}>Start Reading</span>
          </button>
          <button onClick={() => navigate("/books")} className={booksButtonClasses}>
            <span className={iconClasses}>📚</span>
            <span className={textClasses}>View Books</span>
          </button>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScWBtI562YEORBjR8kfVchUEaSqxeTCrZyVVwGZTWmNc_qv1w/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className={feedbackLinkClasses}
          >
            <span className={iconClasses}>💬</span>
            <span className={textClasses}>Leave Feedback</span>
          </a>
        </div>
      </div>

      {/* About section */}
      <div className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-lg p-12 w-full max-w-4xl mb-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          About ReadTimer
        </h2>
        <h3 className="text-xl font-semibold mb-8 text-center text-gray-700 dark:text-gray-300">
          Your Ultimate Reading Companion
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-8 text-center leading-relaxed">
          ReadTimer is designed to make your reading experience more organized and enjoyable.
          Whether you're diving into a novel, studying for school, or exploring new genres,
          ReadTimer helps you stay focused, track your progress, and keep your thoughts in one
          place. Here's how it works:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-3 text-emerald-500">⏳</span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Read with a Timer
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Set a timer to read without distractions. Use the Pomodoro technique to stay focused
              and take breaks when needed.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-3 text-blue-500">📚</span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manage Your Books
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Add books using Google Books search, track your reading progress with a progress bar,
              and edit details anytime.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl mb-3 text-purple-500">📝</span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keep Your Notes
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Write notes after each session. They'll be added to your existing notes, so you never
              lose your thoughts.
            </p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Why Choose ReadTimer?
          </h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Reading can be more than just a hobby — it's a way to grow, learn, and relax. ReadTimer
            helps you build a reading habit by making it easy to stay consistent. With features like
            progress tracking, note-taking, and a clean interface, you'll always know where you left
            off and what you thought about each book.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Perfect for book lovers, students, or anyone who wants to read more. Start your reading
            journey today!
          </p>
        </div>
      </div>

      {/* Product Hunt badge */}
      <div className="mb-10">
        <a
          href="https://www.producthunt.com/posts/readtimer?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-readtimer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=951989&theme=dark&t=1744308300577"
            alt="ReadTimer - Minimalist reading app for focused and calm reading | Product Hunt"
            style={{ width: "250px", height: "54px" }}
            width={250}
            height={54}
          />
        </a>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-auto py-6">
        <p>© 2025 Valeriia Lykhomanova</p>
        <p>
          Contact:{" "}
          <a
            href="mailto:leralikhomanova@gmail.com"
            className="text-emerald-500 hover:underline"
          >
            leralikhomanova@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;

