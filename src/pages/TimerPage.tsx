import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

interface BookProgress {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  note: string;
  status: "reading" | "finished";
}

interface GoogleBookSuggestion {
  title: string;
  author: string;
  totalPages: number;
}

const TimerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBookTitle = searchParams.get("book") || "";

  const [time, setTime] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [sessionLength, setSessionLength] = useState<number>(25 * 60);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>("0");
  const [bookTitle, setBookTitle] = useState<string>(initialBookTitle);
  const [newBookSearchQuery, setNewBookSearchQuery] = useState<string>("");
  const [newBookTitle, setNewBookTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [author, setAuthor] = useState<string>("");
  const [status, setStatus] = useState<"reading" | "finished">("reading");
  const [isBookFinished, setIsBookFinished] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<GoogleBookSuggestion[]>([]);
  const [currentPageMessage, setCurrentPageMessage] = useState<string>("");
  const [pagesProgressed, setPagesProgressed] = useState<number | null>(null);
  const [pauseDuration, setPauseDuration] = useState<number>(5 * 60); // По умолчанию 5 минут
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState<number>(0);

  const [books, setBooks] = useState<BookProgress[]>(() => {
    const savedBooks = localStorage.getItem("readingProgress");
    const parsedBooks = savedBooks ? JSON.parse(savedBooks) : [];
    console.log("TimerPage - Loaded books from localStorage:", parsedBooks);
    return parsedBooks;
  });

  useEffect(() => {
    if (initialBookTitle) {
      const selectedBook = books.find((b: BookProgress) => b.title === initialBookTitle);
      if (selectedBook) {
        setAuthor(selectedBook.author);
        setTotalPages(selectedBook.totalPages);
        setCurrentPageMessage(
          `You are currently on page ${selectedBook.currentPage} of ${selectedBook.totalPages}`
        );
        setCurrentPage(selectedBook.currentPage.toString());
      }
    }
  }, [initialBookTitle, books]);

  useEffect(() => {
    if (!isActive && sessionLength > 0 && !hasStarted && !isPaused) {
      setTime(sessionLength);
    }
  }, [sessionLength, isActive, hasStarted, isPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime((prev: number) => Math.max(0, prev - 1)), 1000);
    } else if (time <= 0 && isActive) {
      setIsActive(false);
      setShowModal(true);
      setHasStarted(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  useEffect(() => {
    let pauseInterval: NodeJS.Timeout | undefined;
    if (isPaused && pauseTimeRemaining > 0) {
      pauseInterval = setInterval(() => {
        setPauseTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPaused(false);
            setIsActive(true);
            setHasStarted(true);
            setTime(sessionLength);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (pauseInterval) clearInterval(pauseInterval);
    };
  }, [isPaused, pauseTimeRemaining, sessionLength]);

  useEffect(() => {
    console.log("TimerPage - Saving books to localStorage:", books);
    localStorage.setItem("readingProgress", JSON.stringify(books));
  }, [books]);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ru&maxResults=5`
      );
      const data = await response.json();
      console.log("TimerPage - Google Books API response (general search):", data);

      let suggestionList: GoogleBookSuggestion[] = [];

      if (data.items && data.items.length > 0) {
        suggestionList = data.items.map((item: any) => ({
          title: item.volumeInfo.title || "Unknown Title",
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown Author",
          totalPages: item.volumeInfo.pageCount || 300,
        }));
        console.log("TimerPage - Processed suggestions (general search):", suggestionList);
      }

      if (suggestionList.length === 0) {
        const fallbackResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&langRestrict=ru&maxResults=5`
        );
        const fallbackData = await fallbackResponse.json();
        console.log("TimerPage - Google Books API response (intitle search):", fallbackData);

        if (fallbackData.items && fallbackData.items.length > 0) {
          suggestionList = fallbackData.items.map((item: any) => ({
            title: item.volumeInfo.title || "Unknown Title",
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown Author",
            totalPages: item.volumeInfo.pageCount || 300,
          }));
          console.log("TimerPage - Processed suggestions (intitle search):", suggestionList);
        }
      }

      setSuggestions(suggestionList);
    } catch (error) {
      console.error("TimerPage - Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleNewBookSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNewBookSearchQuery(query);
    fetchSuggestions(query);
  };

  const handleSuggestionSelect = (suggestion: GoogleBookSuggestion) => {
    setNewBookTitle(suggestion.title);
    setAuthor(suggestion.author);
    setTotalPages(suggestion.totalPages);
    setNewBookSearchQuery("");
    setSuggestions([]);
    setPagesProgressed(null);

    const existingBook = books.find((b: BookProgress) => b.title === suggestion.title);
    if (existingBook) {
      setCurrentPageMessage(`You are currently on page ${existingBook.currentPage} of ${existingBook.totalPages}`);
    } else {
      setCurrentPageMessage("");
    }
  };

  const handleSaveReading = (action: "continue" | "finish" | "pause") => {
    const titleToSave = bookTitle || newBookTitle;
    if (!titleToSave) {
      alert("Please select or enter a book title!");
      return;
    }

    const currentPageNumber = parseInt(currentPage, 10);

    const existingBook = books.find((b: BookProgress) => b.title === titleToSave);
    let updatedBooks: BookProgress[];

    if (existingBook) {
      const pagesAdvanced = currentPageNumber - existingBook.currentPage;
      setPagesProgressed(pagesAdvanced > 0 ? pagesAdvanced : 0);
      updatedBooks = books.map((b: BookProgress) =>
        b.title === titleToSave
          ? {
              ...b,
              currentPage: currentPageNumber,
              note: b.note ? `${b.note}\n${notes}` : notes,
              status: status,
            }
          : b
      );
    } else {
      setPagesProgressed(null);
      const newBook = {
        id: Date.now().toString(),
        title: titleToSave,
        author: author || "Unknown Author",
        currentPage: currentPageNumber,
        totalPages: totalPages || 300,
        note: notes,
        status: status,
      };
      updatedBooks = [...books, newBook];
      console.log("TimerPage - Added new book:", newBook);
    }

    const currentBook = updatedBooks.find((b: BookProgress) => b.title === titleToSave);
    if (currentBook && currentBook.currentPage >= currentBook.totalPages) {
      setIsBookFinished(true);
      currentBook.status = "finished";
    } else {
      setIsBookFinished(false);
    }

    setBooks(updatedBooks);

    // Сбрасываем состояние модального окна
    setCurrentPage("0");
    setBookTitle("");
    setNewBookTitle("");
    setNewBookSearchQuery("");
    setNotes("");
    setTotalPages(0);
    setAuthor("");
    setStatus("reading");
    setSuggestions([]);
    setCurrentPageMessage("");

    if (action === "continue") {
      // Возвращаем к настройке таймера
      setShowModal(false);
      setHasStarted(false);
      setTime(sessionLength);
    } else if (action === "pause") {
      // Запускаем паузу
      if (pauseDuration <= 0) {
        alert("Please set a valid pause duration!");
        return;
      }
      setShowModal(false);
      setIsPaused(true);
      setPauseTimeRemaining(pauseDuration);
    } else {
      // Завершаем и переходим к BooksPage
      setShowModal(false);
      setHasStarted(false);
      navigate("/books");
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  const pauseMinutes = Math.floor(pauseTimeRemaining / 60);
  const pauseSeconds = Math.floor(pauseTimeRemaining % 60);

  const handleToggleTimer = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setTime(25 * 60);
    setSessionLength(25 * 60);
    setIsActive(false);
    setHasStarted(false);
    setIsPaused(false);
    setPauseTimeRemaining(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (sessionLength > 0) {
        setTime(sessionLength);
        setIsActive(true);
        setHasStarted(true);
      }
    }
  };

  const handleSessionLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setSessionLength(0);
      if (!isActive) setTime(0);
      return;
    }
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      const newSessionLength = parsedValue * 60;
      setSessionLength(newSessionLength);
      if (!isActive && !hasStarted) setTime(newSessionLength);
    }
  };

  const handlePauseDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setPauseDuration(0);
      return;
    }
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setPauseDuration(parsedValue * 60);
    }
  };

  const getButtonText = () => {
    if (!hasStarted) return "Start";
    return isActive ? "Pause" : "Resume";
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-lime-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black min-h-screen flex flex-col items-center justify-center p-6 text-gray-800 dark:text-gray-100">
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-[100]">
        <ThemeToggle />
      </div>
      <div className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full max-w-xl">
        <button
          onClick={() => navigate("/")}
          className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-700 dark:to-indigo-800 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:from-purple-400 hover:to-indigo-400 dark:hover:from-purple-600 dark:hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Reading Timer</h1>

        {bookTitle && (
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Currently reading: {bookTitle}
            </p>
            {author && (
              <p className="text-sm text-gray-600 dark:text-gray-300">by {author}</p>
            )}
          </div>
        )}

        {isPaused ? (
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Pause in progress...
            </p>
            <div className="text-6xl font-mono mb-8 text-center text-gray-900 dark:text-gray-100 tracking-wider">
              {pauseMinutes}:{pauseSeconds < 10 ? `0${pauseSeconds}` : pauseSeconds}
            </div>
            <button
              onClick={() => {
                setIsPaused(false);
                setPauseTimeRemaining(0);
                setIsActive(true);
                setHasStarted(true);
                setTime(sessionLength);
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:brightness-110 transition-all duration-300 transform hover:scale-105"
            >
              Skip Pause
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <label className="text-gray-700 dark:text-gray-300">Time (min):</label>
              <input
                type="number"
                step="0.1"
                value={sessionLength / 60 || ""}
                onChange={handleSessionLengthChange}
                onKeyPress={handleKeyPress}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg w-20 text-center text-gray-800 dark:text-gray-100"
                min="0"
                disabled={isActive}
              />
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-emerald-400 dark:bg-emerald-600 transition-all duration-500"
                style={{ width: `${time > 0 ? (time / sessionLength) * 100 : 0}%` }}
              />
            </div>
            <div className="text-6xl font-mono mb-8 text-center text-gray-900 dark:text-gray-100 tracking-wider">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={handleToggleTimer}
                className={`${
                  isActive
                    ? "bg-gradient-to-r from-pink-400 to-rose-400 dark:from-pink-600 dark:to-rose-600"
                    : "bg-gradient-to-r from-green-400 to-emerald-400 dark:from-green-600 dark:to-emerald-600"
                } text-white px-6 py-3 rounded-lg font-medium shadow-md hover:brightness-110 transition-all duration-300 transform hover:scale-105`}
              >
                {getButtonText()}
              </button>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all duration-300 transform hover:scale-105"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto py-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Session Completed!</h2>
              {isBookFinished && (
                <p className="text-green-600 dark:text-green-400 font-semibold mb-4">You finished this book!</p>
              )}
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Current Page:</label>
              <input
                type="text"
                value={currentPage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setCurrentPage(value);
                  }
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                placeholder="Enter the page you finished on"
              />
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Book Title:</label>
              <select
                value={bookTitle}
                onChange={(e) => {
                  setBookTitle(e.target.value);
                  const selectedBook = books.find((b: BookProgress) => b.title === e.target.value);
                  if (selectedBook) {
                    setAuthor(selectedBook.author);
                    setTotalPages(selectedBook.totalPages);
                    setCurrentPageMessage(
                      `You are currently on page ${selectedBook.currentPage} of ${selectedBook.totalPages}`
                    );
                    setCurrentPage(selectedBook.currentPage.toString());
                  } else {
                    setAuthor("");
                    setTotalPages(0);
                    setCurrentPageMessage("");
                    setCurrentPage("0");
                  }
                  setPagesProgressed(null);
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-2 text-gray-800 dark:text-gray-100"
              >
                <option value="">Select a book</option>
                {books.map((book: BookProgress) => (
                  <option key={book.id} value={book.title}>
                    {book.title}
                  </option>
                ))}
              </select>
              {currentPageMessage && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{currentPageMessage}</p>
              )}
              {bookTitle === "" && (
                <>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">Or search for a new book:</label>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={newBookSearchQuery}
                      onChange={handleNewBookSearchChange}
                      className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-gray-800 dark:text-gray-100"
                      placeholder="Start typing a book title..."
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map((suggestion: GoogleBookSuggestion, index: number) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                          >
                            {suggestion.title} by {suggestion.author}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">Book Title:</label>
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                    placeholder="Enter or confirm book title"
                  />
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">Author:</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                    placeholder="Enter or confirm author"
                  />
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">Total Pages:</label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                    min="1"
                    placeholder="Enter or confirm total pages"
                  />
                </>
              )}
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookProgress["status"])}
                className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
              >
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </select>
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Notes:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                placeholder="Add your notes (will be appended to existing notes)"
                rows={3}
              />
              {pagesProgressed !== null && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  You progressed by {pagesProgressed} page{pagesProgressed !== 1 ? "s" : ""}
                </p>
              )}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-gray-700 dark:text-gray-300">Pause Duration (min):</label>
                <input
                  type="number"
                  step="0.1"
                  value={pauseDuration / 60 || ""}
                  onChange={handlePauseDurationChange}
                  className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg w-20 text-center text-gray-800 dark:text-gray-100"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => handleSaveReading("continue")}
                  className="bg-gradient-to-r from-green-400 to-emerald-400 dark:from-green-600 dark:to-emerald-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-300 hover:to-emerald-300 dark:hover:from-green-500 dark:hover:to-emerald-500 transition-all duration-300"
                >
                  Continue Reading
                </button>
                <button
                  onClick={() => handleSaveReading("pause")}
                  className="bg-gradient-to-r from-blue-400 to-indigo-400 dark:from-blue-600 dark:to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-300 hover:to-indigo-300 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all duration-300"
                >
                  Take a Pause
                </button>
                <button
                  onClick={() => handleSaveReading("finish")}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 noqa:from-gray-400 hover:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerPage;
