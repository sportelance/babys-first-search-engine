import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Pagination from "./Pagination"
import SearchResults from "./SearchResults"
import ErrorText from "./Error"
import "./Search.css"

const Search = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const queryParams = new URLSearchParams(location.search)
  const initialQuery = queryParams.get("q") || ""
  const initialPage = parseInt(queryParams.get("p") || "1", 10)

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState([])
  const [totalResults, setTotalResults] = useState(null)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const [error, setError] = useState(null)

  const handleSearchSubmit = async (e) => {
    e.preventDefault()

    await search()
  }

  const search = async () => {
    setError(null)
    setSearchResults([])
    setTotalResults(0)
    let page = currentPage
    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${encodeURIComponent(searchQuery)}&p=${page}`
      )
      if (response.status !== 200) {
        throw new Error(
          `HTTP error! status: ${response.status}, statusText: ${response.statusText}`
        )
      }
      const data = await response.json()
      setSearchResults(data.results)
      setTotalResults(data.totalResults)
      updateUrlParams(searchQuery, page)
    } catch (error) {
      setError(error)
    }
  }

  const updateUrlParams = (query, page) => {
    const newQueryParams = new URLSearchParams()
    newQueryParams.set("q", query)
    newQueryParams.set("p", page)
    navigate(`?${newQueryParams.toString()}`)
  }

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery, initialPage)
    }
  }, [initialQuery, initialPage])

  return (
    <>
      <form className="search-form" onSubmit={handleSearchSubmit}>
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

      {searchResults && error === null ?
        <div id="total-results">
          {searchResults.length === 0 ?
            `No results found for "${searchQuery}".`
          : <>
              Total results: {totalResults}. 
              {Math.ceil(totalResults / 10) > 1 && (
             <> 
             Page {currentPage} / {Math.ceil(totalResults / 10)}
              </>
              )}
            </>
          }
        </div>
      : <></>}
      <ErrorText message={error ? error.message : null} />
      <SearchResults
        searchResults={searchResults}
        totalResults={totalResults}
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page)
          updateUrlParams(searchQuery, page)
          search(searchQuery, page) // Fetch new results when page changes
        }}
      />
      {Math.ceil(totalResults / 10) > 1 && (<Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalResults / 10)}
        setCurrentPage={(page) => {
          setCurrentPage(page)
          updateUrlParams(searchQuery, page)
          search(searchQuery, page) // Fetch new results when page changes
        }}
      /> )}
    </>
  )
}

export default Search
