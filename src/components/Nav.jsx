import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";

import { FiSearch } from "react-icons/fi";
import { BiHomeAlt2, BiSolidMovie, BiStar } from "react-icons/bi";
import { BsTv } from "react-icons/bs";

import posterPlaceholder from "../assets/images/poster-placeholder.png";

export default function Nav() {
  const BASE = import.meta.env.VITE_BASE_URL;
  const SITENAME = import.meta.env.VITE_SITENAME;

  const [query, setQuery] = useState("");
  const [debouncedVal, setDebouncedVal] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [navStatus, setNavStatus] = useState("Home");
  const [theme, setTheme] = useState("dark");

  const location = useLocation();
  const closeSearchResultsDropDown = useRef();

  // 🌙 LOAD THEME
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    }
  }, []);

  // 🌙 TOGGLE THEME
  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  // 📍 NAV ACTIVE STATUS
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setNavStatus("Home");
    else if (path.startsWith("/mov")) setNavStatus("Movies");
    else if (path.startsWith("/ser")) setNavStatus("Series");
  }, [location.pathname]);

  // ⏳ DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVal(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // 🔍 SEARCH API
  useEffect(() => {
    if (debouncedVal.trim() === "") {
      setSearchResult([]);
      return;
    }

    setIsLoading(true);

    fetch(`${BASE}/api/search/?query=${debouncedVal}&page=1`)
      .then((res) => res.json())
      .then((data) => {
        setSearchResult(data.results || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [debouncedVal]);

  // ❌ CLOSE SEARCH DROPDOWN
  useEffect(() => {
    const handler = (e) => {
      if (
        closeSearchResultsDropDown.current &&
        !closeSearchResultsDropDown.current.contains(e.target)
      ) {
        setQuery("");
        setSearchResult([]);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="fixed flex items-center justify-between gap-3 z-20 bg-bgColor/80 backdrop-blur-xl border-b border-white/10 top-0 left-0 right-0 py-4 px-5 md:px-10 text-black dark:text-white">

      {/* 🔥 LEFT (LOGO + THEME) */}
      <div className="flex items-center gap-3">
        <div className="bg-black text-white px-3 py-1 rounded-lg font-bold uppercase">
          cz
        </div>

        <button
          onClick={toggleTheme}
          className="w-14 h-7 flex items-center bg-gray-700 rounded-full p-1"
        >
          <div
            className={`bg-white w-5 h-5 rounded-full transition ${
              theme === "light" ? "translate-x-7" : ""
            }`}
          />
        </button>
      </div>

      {/* 🏷 SITENAME */}
      <Link to="/" className="hidden md:block font-bold text-xl">
        {SITENAME}
      </Link>

      {/* 📌 NAV MENU */}
      <nav className="flex gap-6 text-sm md:text-base">
        <Link
          to="/"
          className={`flex items-center gap-1 ${
            navStatus === "Home"
              ? "text-otherColor font-semibold"
              : "hover:text-otherColor"
          }`}
        >
          <BiHomeAlt2 /> Home
        </Link>

        <Link
          to="/mov"
          className={`flex items-center gap-1 ${
            navStatus === "Movies"
              ? "text-otherColor font-semibold"
              : "hover:text-otherColor"
          }`}
        >
          <BiSolidMovie /> Movies
        </Link>

        <Link
          to="/ser"
          className={`flex items-center gap-1 ${
            navStatus === "Series"
              ? "text-otherColor font-semibold"
              : "hover:text-otherColor"
          }`}
        >
          <BsTv /> Series
        </Link>
      </nav>

      {/* 🔍 SEARCH */}
      <div
        className="relative w-full md:w-1/3"
        ref={closeSearchResultsDropDown}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="w-full py-2 px-4 bg-btnColor rounded-md outline-none"
        />

        <FiSearch className="absolute right-3 top-3" />

        {/* RESULTS */}
        {debouncedVal && (
          <div className="absolute top-12 w-full bg-black text-white rounded-lg p-3 max-h-80 overflow-y-auto z-50">

            {isLoading ? (
              <p>Loading...</p>
            ) : searchResult.length > 0 ? (
              searchResult.map((item) => (
                <Link
                  key={item.tmdb_id}
                  to={
                    item.media_type === "movie"
                      ? `/mov/${item.tmdb_id}`
                      : `/ser/${item.tmdb_id}`
                  }
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded"
                  onClick={() => setQuery("")}
                >
                  <LazyLoadImage
                    src={item.poster || posterPlaceholder}
                    className="w-10 h-14 object-cover rounded"
                  />

                  <div>
                    <p>{item.title}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {item.rating && (
                        <span className="flex items-center gap-1">
                          <BiStar /> {item.rating.toFixed(1)}
                        </span>
                      )}
                      {item.release_year && <span>{item.release_year}</span>}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
