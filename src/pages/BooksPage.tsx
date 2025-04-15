import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; // Импорт ThemeToggle

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

const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookProgress[]>(() => {
    const savedBooks = localStorage.getItem("readingProgress");
    const parsedBooks = savedBooks ? JSON.parse(savedBooks) : [];
    console.log("BooksPage - Loaded books from localStorage:", parsedBooks);
    return parsedBooks;
  });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<string>("");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editAuthor, setEditAuthor] = useState<string>("");
  const [editCurrentPage, setEditCurrentPage] = useState<string>("0");
  const [editTotalPages, setEditTotalPages] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"reading" | "finished">("reading");
  const [editSearchQuery, setEditSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "reading" | "finished">("all");
  const [editSuggestions, setEditSuggestions] = useState<GoogleBookSuggestion[]>([]);

  useEffect(() => {
    console.log("BooksPage - Saving books to localStorage:", books);
    localStorage.setItem("readingProgress", JSON.stringify(books));
  }, [books]);

  const handleDelete = (id: string) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  const handleEditNote = (book: BookProgress) => {
    setEditingBookId(book.id);
    setEditNote(book.note || "");
    setIsEditingNote(true);
  };

  const handleSaveNote = (id: string) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, note: editNote.trim() } : book
      )
    );
    setEditingBookId(null);
    setEditNote("");
    setIsEditingNote(false);
  };

  const handleEditBook = (book: BookProgress) => {
    setEditingBookId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditCurrentPage(book.currentPage.toString());
    setEditTotalPages(book.totalPages);
    setEditStatus(book.status);
    setIsEditingNote(false);
    setEditSearchQuery("");
    setEditSuggestions([]);
  };

  const handleSaveBook = (id: string) => {
    const currentPageNumber = parseInt(editCurrentPage, 10);
    setBooks(
      books.map((book) =>
        book.id === id
          ? {
              ...book,
              title: editTitle,
              author: editAuthor,
              currentPage: currentPageNumber,
              totalPages: editTotalPages,
              status: editStatus,
            }
          : book
      )
    );
    setEditingBookId(null);
    setEditTitle("");
    setEditAuthor("");
    setEditCurrentPage("0");
    setEditTotalPages(0);
    setEditStatus("reading");
    setEditSearchQuery("");
    setEditSuggestions([]);
  };

  const fetchEditSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setEditSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ru&maxResults=5`
      );
      const data = await response.json();
      console.log("BooksPage - Google Books API response (general search):", data);

      let suggestionList: GoogleBookSuggestion[] = [];

      if (data.items && data.items.length > 0) {
        suggestionList = data.items.map((item: any) => ({
          title: item.volumeInfo.title || "Unknown Title",
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown Author",
          totalPages: item.volumeInfo.pageCount || 300,
        }));
        console.log("BooksPage - Processed suggestions (general search):", suggestionList);
      }

      if (suggestionList.length === 0) {
        const fallbackResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&langRestrict=ru&maxResults=5`
        );
        const fallbackData = await fallbackResponse.json();
        console.log("BooksPage - Google Books API response (intitle search):", fallbackData);

        if (fallbackData.items && data.items.length > 0) {
          suggestionList = fallbackData.items.map((item: any) => ({
            title: item.volumeInfo.title || "Unknown Title",
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(", ") : "Unknown Author",
            totalPages: item.volumeInfo.pageCount || 300,
          }));
          console.log("BooksPage - Processed suggestions (intitle search):", suggestionList);
        }
      }

      setEditSuggestions(suggestionList);
    } catch (error) {
      console.error("BooksPage - Error fetching suggestions:", error);
      setEditSuggestions([]);
    }
  };

  const handleEditSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setEditSearchQuery(query);
    fetchEditSuggestions(query);
  };

  const handleEditSuggestionSelect = (suggestion: GoogleBookSuggestion) => {
    setEditTitle(suggestion.title);
    setEditAuthor(suggestion.author);
    setEditTotalPages(suggestion.totalPages);
    setEditSearchQuery("");
    setEditSuggestions([]);
  };

  // Новая функция для обработки нажатия на кнопку "Read"
  const handleReadBook = (title: string) => {
    navigate(`/timer?book=${encodeURIComponent(title)}`);
  };

  const filteredBooks = books.filter((book) => {
    if (filter === "all") return true;
    return book.status === filter;
  });

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

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Your Books</h1>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-400 to-indigo-400 dark:from-blue-600 dark:to-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("reading")}
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 ${
              filter === "reading"
                ? "bg-gradient-to-r from-green-400 to-emerald-400 dark:from-green-600 dark:to-emerald-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Reading
          </button>
          <button
            onClick={() => setFilter("finished")}
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 transform hover:scale-105 ${
              filter === "finished"
                ? "bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Finished
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-inner">
          {filteredBooks.length > 0 ? (
            <ul className="space-y-4">
              {filteredBooks.map((book) => {
                const progress = Math.min(
                  Math.round((book.currentPage / book.totalPages) * 100),
                  100
                );
                return (
                  <li key={book.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg space-y-2">
                    <div className="flex-1">
                      {editingBookId === book.id && !isEditingNote ? (
                        <div>
                          <label className="block mb-2 text-gray-700 dark:text-gray-300">Search for a book:</label>
                          <div className="relative mb-4">
                            <input
                              type="text"
                              value={editSearchQuery}
                              onChange={handleEditSearchChange}
                              className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg text-gray-800 dark:text-gray-100"
                              placeholder="Start typing a book title..."
                            />
                            {editSuggestions.length > 0 && (
                              <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                                {editSuggestions.map((suggestion: GoogleBookSuggestion, index: number) => (
                                  <li
                                    key={index}
                                    onClick={() => handleEditSuggestionSelect(suggestion)}
                                    className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-100"
                                  >
                                    {suggestion.title} by {suggestion.author}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <label className="block mb-2 text-gray-700 dark:text-gray-300">Title:</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                          />
                          <label className="block mb-2 text-gray-700 dark:text-gray-300">Author:</label>
                          <input
                            type="text"
                            value={editAuthor}
                            onChange={(e) => setEditAuthor(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                          />
                          <label className="block mb-2 text-gray-700 dark:text-gray-300">Current Page:</label>
                          <input
                            type="text"
                            value={editCurrentPage}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                setEditCurrentPage(value);
                              }
                            }}
                            className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                            placeholder="Enter current page"
                          />
                          <label className="block mb-2 text-gray-700 dark:text-gray-300">Total Pages:</label>
                          <input
                            type="number"
                            value={editTotalPages}
                            onChange={(e) => setEditTotalPages(Number(e.target.value))}
                            className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                            min="1"
                          />
                          <label className="block mb-2 text-gray-700 dark:text-gray-300">Status:</label>
                          <select
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as "reading" | "finished")
                            }
                            className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg mb-4 text-gray-800 dark:text-gray-100"
                          >
                            <option value="reading">Reading</option>
                            <option value="finished">Finished</option>
                          </select>
                          <button
                            onClick={() => handleSaveBook(book.id)}
                            className="bg-gradient-to-r from-green-400 to-emerald-400 dark:from-green-600 dark:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:from-green-300 hover:to-emerald-300 dark:hover:from-green-500 dark:hover:to-emerald-500 transition-all duration-300 transform hover:scale-105"
                          >
                            Save Book
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-800 dark:text-gray-100 font-medium">{book.title}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">by {book.author}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Progress: {book.currentPage} / {book.totalPages} ({progress}%)
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full">
                            <div
                              className="h-full bg-emerald-400 dark:bg-emerald-600 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Status: {book.status}</p>
                          {editingBookId === book.id && isEditingNote ? (
                            <div>
                              <textarea
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg mb-2 text-gray-800 dark:text-gray-100"
                                placeholder="Edit your note"
                              />
                              <button
                                onClick={() => handleSaveNote(book.id)}
                                className="bg-gradient-to-r from-green-400 to-emeqrald-400 dark:from-green-600 dark:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:from-green-300 hover:to-emerald-300 dark:hover:from-green-500 dark:hover:to-emerald-500 transition-all duration-300 transform hover:scale-105"
                              >
                                Save Note
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Note: {book.note || "No notes"}
                              </p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <button
                                  onClick={() => handleReadBook(book.title)}
                                  className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-yellow-300 hover:to-orange-300 dark:hover:from-yellow-500 dark:hover:to-orange-500 transition-all duration-300 transform hover:scale-105"
                                >
                                  Read
                                </button>
                                <button
                                  onClick={() => handleEditBook(book)}
                                  className="bg-gradient-to-r from-blue-400 to-indigo-400 dark:from-blue-600 dark:to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-blue-300 hover:to-indigo-300 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all duration-300 transform hover:scale-105"
                                >
                                  Edit Book
                                </button>
                                <button
                                  onClick={() => handleEditNote(book)}
                                  className="bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-600 dark:to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-teal-300 hover:to-cyan-300 dark:hover:from-teal-500 dark:hover:to-cyan-500 transition-all duration-300 transform hover:scale-105"
                                >
                                  Edit Note
                                </button>
                                <button
                                  onClick={() => handleDelete(book.id)}
                                  className="bg-gradient-to-r from-red-400 to-rose-400 dark:from-red-600 dark:to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-red-300 hover:to-rose-300 dark:hover:from-red-500 dark:hover:to-rose-500 transition-all duration-300 transform hover:scale-105"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              {filter === "all"
                ? "No books yet. Add some on the timer page!"
                : `No books with status "${filter}".`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
