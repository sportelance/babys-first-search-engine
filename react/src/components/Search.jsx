import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "./Pagination";
import SearchResults from "./SearchResults";
import "./Search.css";

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";
  const initialPage = parseInt(queryParams.get("p") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
const [error, setError] = useState(null);
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    updateUrlParams(searchQuery, 1); // Reset to page 1 on new search
    await search(searchQuery, 1);
  };

  const search = async (query, page) => {
    setError(null);
    setSearchResults([]);
    setTotalResults(0);

    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${encodeURIComponent(query)}&p=${page}`
      );
      const data = await response.json();
      setSearchResults(data.results);
      setTotalResults(data.totalResults);
    } catch (error) {
      setError(error);
    }
  };

  const updateUrlParams = (query, page) => {
    const newQueryParams = new URLSearchParams();
    newQueryParams.set("q", query);
    newQueryParams.set("p", page);
    navigate(`?${newQueryParams.toString()}`);
  };

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery, initialPage);
    }
  }, [initialQuery, initialPage]);

  return (
    <>
      <form onSubmit={handleSearchSubmit}>
        <div className="input">
          <input
            type="text"
            id="search-query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
          />
          <label htmlFor="search-query">Query</label>
        </div>
        <button id="search-submit" type="submit">
          Go
        </button>
      </form>

      {searchResults && searchResults.length > 0 && error === null ? (
        <div id="total-results">
          Total results: {totalResults}. Page {currentPage} /{" "}
          {Math.ceil(totalResults / 10)}
        </div>
      ) : (
        <></>
      )}
{error && <div className="error">{error.message}</div>}
      <SearchResults
        searchResults={searchResults}
        totalResults={totalResults}
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          updateUrlParams(searchQuery, page);
          search(searchQuery, page); // Fetch new results when page changes
        }}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalResults / 10)}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          updateUrlParams(searchQuery, page);
          search(searchQuery, page); // Fetch new results when page changes
        }}
      />
    </>
  );
};

export default Search;