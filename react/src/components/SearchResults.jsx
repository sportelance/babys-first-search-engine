import react, { useState } from "react"

const SingleResult = ({ index, href, title }) => {
  return (
    <li key={index}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {title}
      </a>
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
