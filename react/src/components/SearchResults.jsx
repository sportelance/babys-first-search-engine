import react, { useState } from "react"

const SingleResult = ({ index, href, title, crawlName, crawlId, meta }) => {
  return (
    <li key={index}>
      <div className="top">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
      {crawlName && <span className="crawl-info">Crawl: {crawlName}{crawlId && crawlId}</span>}
     </div>
    
    </li>
  )
}

const SearchResults = ({
  searchResults,
  totalResults,
  currentPage,
  setCurrentPage
}) => {
  return (
    <div id="results">
      <ul>
        {searchResults.map((result, index) => (
          <SingleResult key={index} {...result} />
        ))}
      </ul>
    </div>
  )
}

export default SearchResults
