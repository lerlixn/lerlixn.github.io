import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Note {
  date: string;
  book: string;
  text: string;
}

const NotesPage = () => {
  const [notesList, setNotesList] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("readingNotes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const navigate = useNavigate();

  const deleteNote = (index: number) => {
    setNotesList((prev: Note[]) => {
      const newNotes = [...prev];
      newNotes.splice(index, 1);
      localStorage.setItem("readingNotes", JSON.stringify(newNotes));
      return newNotes;
    });
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 min-h-screen flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="bg eryth/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <button
          onClick={() => navigate("/")}
          className="mb-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:from-teal-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105"
        >
          Back to Home
        </button>
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Your Reading Notes</h1>
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
          {notesList.length > 0 ? (
            <ul className="space-y-4">
              {notesList.map((note: Note, index: number) => (
                <li key={index} className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{new Date(note.date).toLocaleString()}</p>
                  <p className="font-semibold">{note.book}</p>
                  <p>{note.text}</p>
                  <button
                    onClick={() => deleteNote(index)}
                    className="mt-2 bg-gradient-to-r from-red-400 to-rose-400 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md hover:from-red-300 hover:to-rose-300 transition-all duration-300 transform hover:scale-105"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No notes yet. Add some during your reading sessions!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;