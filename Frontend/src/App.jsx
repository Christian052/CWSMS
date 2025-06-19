import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./component/Dashboard";
import ManageCar from "./component/ManageCar";
import Managerpackage from "./component/ManagePackage";
import Managerpayment from "./component/Managerpayment";
import Managerservice from "./component/Managerservice";
import ManageUser from "./component/ManageUser";
import AuthForm from "./component/AuthForm";

// 🔘 Dark Mode Toggle Component
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition"
    >
      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

// ✅ Main App Component
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Router>
        <ThemeToggle />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/car" element={<ManageCar />} />
          <Route path="/package" element={<Managerpackage />} />
          <Route path="/payment" element={<Managerpayment />} />
          <Route path="/service" element={<Managerservice />} />
          <Route path="/user" element={<ManageUser />} />
          <Route path="*" element={<AuthForm type="login" />} />
          <Route path="/signup" element={<AuthForm type="signup" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
