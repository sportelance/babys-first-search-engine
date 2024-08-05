import react, { useState } from "react"
import Pagination from "./Pagination"
import SearchResults from "./SearchResults"
import "./Search.css"
const Search = ({}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    await search()
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
        <button id="search-submit" type="submit">Go</button>
      </form>

     {searchResults && searchResults.length > 0 ? <div id="total-results">Total results: {totalResults}. Page {currentPage} / {Math.ceil(totalResults / 10)}</div>: <></>}
      <SearchResults
        searchResults={searchResults}
        totalResults={totalResults}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalResults / 10)}
        setCurrentPage={setCurrentPage}
      />
    </>
  )
}
export default Search
