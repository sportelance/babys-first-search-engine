import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const Crawls = ({ notify }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const initialCrawl = queryParams.get("crawl") || ""

  const [crawlId, setCrawlId] = useState(initialCrawl)
  const [crawls, setCrawls] = useState([])

  useEffect(() => {
    const getCrawls = async () => {
      try {
        let results = await fetch("http://localhost:3000/crawls/" + crawlId)
        let data = await results.json()
        setCrawls(data)
      } catch (error) {
        notify(`Error fetching crawls ${error.message}`)
      }
    }
    getCrawls()
  }, [crawlId])

  return <>ass</>
}

export default Crawls
