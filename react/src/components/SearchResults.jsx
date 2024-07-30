import react, { useState } from "react"
import "./SearchResults.css"
const SingleResult = ({ index, href, title, crawlName, crawlId, meta }) => {
  return (
    <li key={index}>
      <div className="top">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
      {crawlName && <span className="crawl-info">Crawl: {crawlName}{crawlId && crawlId}</span>}
     {meta && (
      
        <div className="meta">
          
          {meta.description && <p>{meta.description}</p>}
          </div>
          )}
     </div>
    
    </li>
  )
}

const SearchResults = ({
  searchResults,

}) => {
  console.log(searchResults)
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
