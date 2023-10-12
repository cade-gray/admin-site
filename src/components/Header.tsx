import { Link } from "react-router-dom";
import { LoginProps } from "../interfaces/LoginPropsInterface";
import { useState, useRef, useEffect } from "react";
import { logoutPost } from "../lib/logoutPost.ts";
const Header: React.FC<LoginProps> = ({ loggedIn, setLoggedIn }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    logoutPost();
    sessionStorage.removeItem("cg-admin-token");
    setLoggedIn(false);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleDocumentClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      closeDropdown();
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("click", handleDocumentClick);
    } else {
      document.removeEventListener("click", handleDocumentClick);
    }
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [dropdownOpen]);

  if (!loggedIn) {
    return null;
  }

  return (
    <ul className="flex items-center justify-between bg-sky-500 p-3 shadow-lg min-w-full font-mono">
      <li>
        <h1 className="text-md md:text-xl">Administration</h1>
        <h2 className="text-md">CADEGRAY.DEV</h2>
      </li>
      <li className="relative text-sm md:text-lg" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {dropdownOpen && (
          <ul className="absolute top-8 right-1 bg-green-500 border border-slate-700 w-48 text-center shadow-lg rounded-xl">
            <Link to="/home" onClick={closeDropdown}>
              <li className="text-lg md:text-xl  p-3 hover:bg-green-700 hover:rounded-t-xl border-b border-slate-700">
                Home
              </li>
            </Link>
            <Link to="/guests" onClick={closeDropdown}>
              <li className="text-lg md:text-xl p-3 hover:bg-green-700 border-b border-slate-700">
                Wedding Guests
              </li>
            </Link>
            <li className="text-lg md:text-xl p-3 hover:bg-green-700 hover:rounded-b-xl">
              <button
                onClick={() => {
                  handleLogout();
                  closeDropdown();
                }}
              >
                Logout
              </button>
            </li>
            {/* Add other navigation links as needed */}
          </ul>
        )}
      </li>
    </ul>
  );
};

export default Header;
