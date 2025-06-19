import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCar,
  FaBox,
  FaTools,
  FaMoneyCheckAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaUser,
  FaUserAlt,
  FaUserFriends,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        className="md:hidden p-4 text-white bg-gray-800 fixed z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`${isOpen ? "block" : "hidden"} w-64 overflow-y-auto text-white bg-gray-800 sticky top-0 h-screen`}
      >
        {/* Admin Profile */}
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-600 mb-6">
          <FaUserCircle size={40} />
          <div>
            <h2 className="font-bold text-lg">Admin</h2>
            <p className="text-sm text-gray-400">admin@cwsms.com</p>
          </div>
        </div>

        {/* Sidebar Links */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded transition"
        >
          <FaTachometerAlt />
          Dashboard
        </Link>
        <Link
          to="/Car"
          className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded transition"
        >
          <FaCar />
          Manage Car
        </Link>
        <Link
          to="/package"
          className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded transition"
        >
          <FaBox />
          Manage Package
        </Link>
        <Link
          to="/service"
          className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded transition"
        >
          <FaTools />
          Manage Service
        </Link>
        <Link
          to="/payment"
          className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded transition"
        >
          <FaMoneyCheckAlt />
          Manage Payment
        </Link>
        <Link
          to="/user"
          className="flex items-center gap-3 hover:bg-gray-700 px-4 py-2 rounded transition"
        >
          <FaUserFriends />
          Manage User
        </Link>
      </div>
    </>
  );
};

export default Sidebar;
