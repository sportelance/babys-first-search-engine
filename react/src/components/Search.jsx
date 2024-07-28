import react, { useState } from "react"
import Pagination from "./Pagination"
import SearchResults from "./SearchResults"
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
    <div className="tab active">
      <form onSubmit={handleSearchSubmit}>
        <div className="input">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
          />
          <label htmlFor="search-query">Query</label>
        </div>
        <button type="submit">Go</button>
      </form>

      <div id="total-results">Total results: {totalResults}</div>
      <SearchResults
        searchResults={searchResults}
        totalResults={totalResults}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  )
}
export default Search
