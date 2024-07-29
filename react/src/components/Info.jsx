import React, { useEffect, useState } from "react"

const Info = ({}) => {
  const [crawls, setCrawls] = useState([])
  const [totalDocs, setTotalDocs] = useState(0)
  const getInfo = async () => {
    let resp = await fetch("http://localhost:3000/stats")
    let data = await resp.json()
    console.log(data)
    setCrawls(data.uniqueCrawlNames)
    setTotalDocs(data.totalDocuments)
  }
  useEffect(() => {
    getInfo()
  }, [])
  return (
    <>
      {totalDocs && <span>Total number of indexed docs:{totalDocs} </span>}
      <span>Crawls completed:</span>
      <ul>
        {crawls.map((crawl, index) => (
          <li key={index}>{crawl}</li>
        ))}
      </ul>
    </>
  )
}
export default Info
