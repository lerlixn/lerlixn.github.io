import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TimerPage from "./pages/TimerPage";
import BooksPage from "./pages/BooksPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/books" element={<BooksPage />} />
      </Routes>
    </Router>
  );
};

export default App;