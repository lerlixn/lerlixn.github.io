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

const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookProgress[]>(() => {
    const savedBooks = localStorage.getItem("readingProgress");
    return savedBooks ? JSON.parse(savedBooks) : [];
  });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<string>("");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editAuthor, setEditAuthor] = useState<string>("");
  const [editPagesRead, setEditPagesRead] = useState<number>(0);
  const [editTotalPages, setEditTotalPages] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"reading" | "finished" | "to-read">("reading");
  const [editSearchQuery, setEditSearchQuery] = useState<string>(""); // Новое поле для поиска

  useEffect(() => {
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
    setEditPagesRead(book.pagesRead);
    setEditTotalPages(book.totalPages);
    setEditStatus(book.status);
    setIsEditingNote(false);
    setEditSearchQuery(""); // Очищаем поле поиска при открытии редактирования
  };

  const handleSaveBook = (id: string) => {
    setBooks(
      books.map((book) =>
        book.id === id
          ? {
              ...book,
              title: editTitle,
              author: editAuthor,
              pagesRead: editPagesRead,
              totalPages: editTotalPages,
              status: editStatus,
            }
          : book
      )
    );
    setEditingBookId(null);
    setEditTitle("");
    setEditAuthor("");
    setEditPagesRead(0);
    setEditTotalPages(0);
    setEditStatus("reading");
    setEditSearchQuery("");
  };

  // Функция поиска книги через Google Books API
  const handleEditSearch = async () => {
    if (!editSearchQuery.trim()) return;
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${editSearchQuery}&maxResults=1`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      setEditTitle(book.title);
      setEditAuthor(book.authors ? book.authors.join(", ") : "Unknown Author");
      setEditTotalPages(book.pageCount || 300);
      setEditSearchQuery(""); // Очищаем поле поиска после успешного запроса
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

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Your Books</h1>

        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          {books.length > 0 ? (
            <ul className="space-y-4">
              {books.map((book) => {
                const progress = Math.min(
                  Math.round((book.pagesRead / book.totalPages) * 100),
                  100
                );
                return (
                  <li key={book.id} className="p-3 bg-gray-100 rounded-lg space-y-2">
                    {editingBookId === book.id && !isEditingNote ? (
                      <div>
                        <label className="block mb-2 text-gray-700">Search for a book:</label>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={editSearchQuery}
                            onChange={(e) => setEditSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 px-2 py-1 rounded-lg"
                            placeholder="Search Google Books"
                          />
                          <button
                            onClick={handleEditSearch}
                            className="bg-gradient-to-r from-teal-400 to-indigo-400 text-white px-4 py-1 rounded-lg shadow-md hover:from-teal-300 hover:to-indigo-300 transition-all duration-300"
                          >
                            Search
                          </button>
                        </div>
                        <label className="block mb-2 text-gray-700">Title:</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                        />
                        <label className="block mb-2 text-gray-700">Author:</label>
                        <input
                          type="text"
                          value={editAuthor}
                          onChange={(e) => setEditAuthor(e.target.value)}
                          className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                        />
                        <label className="block mb-2 text-gray-700">Pages Read:</label>
                        <input
                          type="number"
                          value={editPagesRead}
                          onChange={(e) => setEditPagesRead(Number(e.target.value))}
                          className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                          min="0"
                        />
                        <label className="block mb-2 text-gray-700">Total Pages:</label>
                        <input
                          type="number"
                          value={editTotalPages}
                          onChange={(e) => setEditTotalPages(Number(e.target.value))}
                          className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                          min="1"
                        />
                        <label className="block mb-2 text-gray-700">Status:</label>
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as "reading" | "finished" | "to-read")
                          }
                          className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-4"
                        >
                          <option value="reading">Reading</option>
                          <option value="finished">Finished</option>
                          <option value="to-read">To Read</option>
                        </select>
                        <button
                          onClick={() => handleSaveBook(book.id)}
                          className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:from-green-300 hover:to-emerald-300 transition-all duration-300 transform hover:scale-105"
                        >
                          Save Book
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800 font-medium">{book.title}</p>
                        <p className="text-gray-600 text-sm">by {book.author}</p>
                        <p className="text-gray-600 text-sm">
                          Pages Read: {book.pagesRead} / {book.totalPages} ({progress}%)
                        </p>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-gray-600 text-sm">Status: {book.status}</p>
                        {editingBookId === book.id && isEditingNote ? (
                          <div>
                            <textarea
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="w-full bg-gray-100 px-2 py-1 rounded-lg mb-2"
                              placeholder="Edit your note"
                            />
                            <button
                              onClick={() => handleSaveNote(book.id)}
                              className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:from-green-300 hover:to-emerald-300 transition-all duration-300 transform hover:scale-105"
                            >
                              Save Note
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-500 text-sm">
                              Note: {book.note || "No notes"}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEditBook(book)}
                                className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-blue-300 hover:to-indigo-300 transition-all duration-300 transform hover:scale-105"
                              >
                                Edit Book
                              </button>
                              <button
                                onClick={() => handleEditNote(book)}
                                className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-teal-300 hover:to-cyan-300 transition-all duration-300 transform hover:scale-105"
                              >
                                Edit Note
                              </button>
                              <button
                                onClick={() => handleDelete(book.id)}
                                className="bg-gradient-to-r from-red-400 to-rose-400 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:from-red-300 hover:to-rose-300 transition-all duration-300 transform hover:scale-105"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No books yet. Add some on the timer page!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksPage;