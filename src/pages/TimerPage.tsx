import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface BookProgress {
  id: string;
  title: string;
  author: string;
  pagesRead: number;
  totalPages: number;
  note: string;
  status: "reading" | "finished" | "to-read";
}

interface GoogleBookSuggestion {
  title: string;
  author: string;
  totalPages: number;
}

const TimerPage: React.FC = () => {
  const navigate = useNavigate();

  const [time, setTime] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionLength, setSessionLength] = useState<number>(25 * 60);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [newBookSearchQuery, setNewBookSearchQuery] = useState<string>("");
  const [newBookTitle, setNewBookTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [author, setAuthor] = useState<string>("");
  const [status, setStatus] = useState<"reading" | "finished" | "to-read">("reading");
  const [isBookFinished, setIsBookFinished] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<GoogleBookSuggestion[]>([]);
  const [currentPageMessage, setCurrentPageMessage] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [books, setBooks] = useState<BookProgress[]>(() => {
    const savedBooks = localStorage.getItem("readingProgress");
    return savedBooks ? JSON.parse(savedBooks) : [];
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime((prev) => prev - 1), 1000);
    } else if (time === 0) {
      setIsActive(false);
      setShowModal(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  useEffect(() => {
    localStorage.setItem("readingProgress", JSON.stringify(books));
  }, [books]);

  // Функция для получения подсказок от Google Books API
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const suggestionList = data.items.map((item: any) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown Author",
        totalPages: item.volumeInfo.pageCount || 300,
      }));
      setSuggestions(suggestionList);
    } else {
      setSuggestions([]);
    }
  };

  // Обработка ввода в поле поиска новой книги
  const handleNewBookSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNewBookSearchQuery(query);
    fetchSuggestions(query);
  };

  // Обработка выбора книги из подсказок
  const handleSuggestionSelect = (suggestion: GoogleBookSuggestion) => {
    setNewBookTitle(suggestion.title);
    setAuthor(suggestion.author);
    setTotalPages(suggestion.totalPages);
    setNewBookSearchQuery("");
    setSuggestions([]);

    const existingBook = books.find((b) => b.title === suggestion.title);
    if (existingBook) {
      setCurrentPageMessage(`You have already read ${existingBook.pagesRead} pages of ${existingBook.totalPages}`);
    } else {
      setCurrentPageMessage("");
    }
  };

  const handleSaveReading = (continueReading: boolean) => {
    const titleToSave = bookTitle || newBookTitle;
    if (!titleToSave) {
      alert("Please select or enter a book title!");
      return;
    }

    const existingBook = books.find((b) => b.title === titleToSave);
    let updatedBooks: BookProgress[];

    if (existingBook) {
      updatedBooks = books.map((b) =>
        b.title === titleToSave
          ? {
              ...b,
              pagesRead: b.pagesRead + pagesRead,
              note: b.note ? `${b.note}\n${notes}` : notes,
              status: status,
            }
          : b
      );
    } else {
      updatedBooks = [
        ...books,
        {
          id: Date.now().toString(),
          title: titleToSave,
          author: author || "Unknown Author",
          pagesRead,
          totalPages: totalPages || 300,
          note: notes,
          status: status,
        },
      ];
    }

    const currentBook = updatedBooks.find((b) => b.title === titleToSave);
    if (currentBook && currentBook.pagesRead >= currentBook.totalPages) {
      setIsBookFinished(true);
      currentBook.status = "finished";
    } else {
      setIsBookFinished(false);
    }

    setBooks(updatedBooks);
    setPagesRead(0);
    setBookTitle("");
    setNewBookTitle("");
    setNewBookSearchQuery("");
    setNotes("");
    setTotalPages(0);
    setAuthor("");
    setStatus("reading");
    setSuggestions([]);
    setCurrentPageMessage("");
    setShowModal(false);

    if (continueReading) {
      setTime(sessionLength);
      setIsActive(true);
    } else {
      navigate("/");
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const handleStartStop = () => setIsActive(!isActive);
  const handleReset = () => {
    setTime(sessionLength);
    setIsActive(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      setBooks([
        ...books,
        {
          id: data.items[0].id,
          title: book.title,
          author: book.authors ? book.authors.join(", ") : "Unknown Author",
          pagesRead: 0,
          totalPages: book.pageCount || 300,
          note: "",
          status: "to-read",
        },
      ]);
      setSearchQuery("");
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-lime-50 to-purple-50 min-h-screen flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-10 w-full max-w-xl">
        <button
          onClick={() => navigate("/")}
          className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:from-purple-400 hover:to-indigo-400 transition-all duration-300 transform hover:scale-105"
        >
          Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Reading Timer</h1>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <label className="text-gray-700">Time (min):</label>
            <input
              type="number"
              value={sessionLength / 60}
              onChange={(e) => setSessionLength(Number(e.target.value) * 60)}
              className="bg-gray-100 px-2 py-1 rounded-lg w-20 text-center"
              min="1"
              disabled={isActive}
            />
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${((sessionLength - time) / sessionLength) * 100}%` }}
            />
          </div>
          <div className="text-6xl font-mono mb-8 text-center text-gray-900 tracking-wider">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleStartStop}
              className={`${
                isActive
                  ? "bg-gradient-to-r from-pink-400 to-rose-400"
                  : "bg-gradient-to-r from-green-400 to-emerald-400"
              } text-white px-6 py-3 rounded-lg font-medium shadow-md hover:brightness-110 transition-all duration-300 transform hover:scale-105`}
            >
              {isActive ? "Pause" : "Start"}
            </button>
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-gray-400 hover:to-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-100 text-gray-800 px-6 py-4 rounded-lg text-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
            placeholder="Search for a book"
          />
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-teal-400 to-indigo-400 text-white px-6 py-4 rounded-lg font-medium shadow-md hover:from-teal-300 hover:to-indigo-300 transition-all duration-300 transform hover:scale-105"
          >
            Add
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Session Completed!</h2>
              {isBookFinished && (
                <p className="text-green-600 font-semibold mb-4">You finished this book!</p>
              )}
              <label className="block mb-2 text-gray-700">Pages Read:</label>
              <input
                type="number"
                value={pagesRead}
                onChange={(e) => setPagesRead(Number(e.target.value))}
                className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                min="0"
                placeholder="Enter pages read"
              />
              <label className="block mb-2 text-gray-700">Book Title:</label>
              <select
                value={bookTitle}
                onChange={(e) => {
                  setBookTitle(e.target.value);
                  const selectedBook = books.find((b) => b.title === e.target.value);
                  if (selectedBook) {
                    setAuthor(selectedBook.author);
                    setTotalPages(selectedBook.totalPages);
                    setCurrentPageMessage(
                      `You have already read ${selectedBook.pagesRead} pages of ${selectedBook.totalPages}`
                    );
                  } else {
                    setAuthor("");
                    setTotalPages(0);
                    setCurrentPageMessage("");
                  }
                }}
                className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-2"
              >
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.title}>
                    {book.title}
                  </option>
                ))}
              </select>
              {currentPageMessage && (
                <p className="text-gray-600 text-sm mb-4">{currentPageMessage}</p>
              )}
              {bookTitle === "" && (
                <>
                  <label className="block mb-2 text-gray-700">Or search for a new book:</label>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={newBookSearchQuery}
                      onChange={handleNewBookSearchChange}
                      className="w-full bg-gray-100 px-2 py-1 rounded-lg"
                      placeholder="Start typing a book title..."
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          >
                            {suggestion.title} by {suggestion.author}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <label className="block mb-2 text-gray-700">Book Title:</label>
                  <input
                    type="text"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                    placeholder="Enter or confirm book title"
                  />
                  <label className="block mb-2 text-gray-700">Author:</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                    placeholder="Enter or confirm author"
                  />
                  <label className="block mb-2 text-gray-700">Total Pages:</label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                    min="1"
                    placeholder="Enter or confirm total pages"
                  />
                </>
              )}
              <label className="block mb-2 text-gray-700">Status:</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "reading" | "finished" | "to-read")
                }
                className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
              >
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
                <option value="to-read">To Read</option>
              </select>
              <label className="block mb-2 text-gray-700">Notes:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                placeholder="Add your notes (will be appended to existing notes)"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleSaveReading(true)}
                  className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-300 hover:to-emerald-300 transition-all duration-300"
                >
                  Continue Reading
                </button>
                <button
                  onClick={() => handleSaveReading(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-gray-400 hover:to-gray-500 transition-all duration-300"
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