import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"


const Crawls = () => {
    const [crawls, setCrawls] = useState([])
  useEffect(() => {
    const getCrawls = async () => {
    let results = await fetch("http://localhost:3000/crawls")
    let data = await results.json()
    setCrawls(data)
    }
    getCrawls()
    }, [])

  return (
    <>
      {crawls.map((crawl) => (
        <div key={crawl.id}>
          <h3>{crawl.url}</h3>
          <p>{crawl.status}</p>
        </div>
      ))}
    </>
  )
}

export default Crawls
