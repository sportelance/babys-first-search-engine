import React, { useState, useEffect } from "react"
import { useLocation, useNavigate, BrowserRouter as Router } from "react-router-dom"
import Pagination from "./Pagination"
import SearchResults from "./SearchResults"
import "./Search.css"

const Search = () => {
  const location = useLocation()
  const history = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const initialQuery = queryParams.get("q") || ""
  const initialPage = parseInt(queryParams.get("p"), 10) || 1

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)

  useEffect(() => {
    if (searchQuery) {
      search()
    }
  }, [location.search])

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    updateUrlParams(searchQuery, 1)
  }

  const search = async () => {
    setSearchResults([])
    setTotalResults(0)

    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${encodeURIComponent(searchQuery)}&p=${currentPage}`
      )
      const data = await response.json()
      setSearchResults(data.results)
      setTotalResults(data.totalResults)
    } catch (error) {
      setSearchResults([{ title: "An error occurred", href: "#" }])
    }
  }

  const updateUrlParams = (query, page) => {
    const newQueryParams = new URLSearchParams(location.search)
    newQueryParams.set("q", query)
    newQueryParams.set("p", page)
    history.push({ search: newQueryParams.toString() })
  }

  useEffect(() => {
    setSearchQuery(initialQuery)
    setCurrentPage(initialPage)
  }, [initialQuery, initialPage])

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

        {searchResults && searchResults.length > 0 ?
          <div id="total-results">
            Total results: {totalResults}. Page {currentPage} /{" "}
            {Math.ceil(totalResults / 10)}
          </div>
        : <></>}
        <>  <Router>
        <SearchResults
          searchResults={searchResults}
          totalResults={totalResults}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page)
            updateUrlParams(searchQuery, page)
          }}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalResults / 10)}
          setCurrentPage={(page) => {
            setCurrentPage(page)
            updateUrlParams(searchQuery, page)
          }}
        />

     </Router>
     </>
    </>
  )
}

export default Search
