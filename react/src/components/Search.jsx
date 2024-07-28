import react, {useState} from "react"


const Search = ({}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        await search();
      };
    
      const search = async () => {
        setSearchResults([]);
        setTotalResults(0);
    
        try {
          const response = await fetch(`/search?q=${encodeURIComponent(searchQuery)}&p=${currentPage}`);
          const data = await response.json();
          setSearchResults(data.results);
          setTotalResults(data.totalResults);
        } catch (error) {
          setSearchResults([{ title: 'An error occurred', href: '#' }]);
        }
      };
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
        <div id="results">
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                <a href={result.href} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div id="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={searchResults.length === 0}>
            Next
          </button>
        </div>
      </div>
    )
}
export default Search