import React, { useEffect, useState } from "react"

const Info = ({}) => {
  const [crawls, setCrawls] = useState([])

  const getInfo = async () => {
    let resp = await fetch("http://localhost:3000/stats")
    let data = await resp.json()
    console.log(data)
    setCrawls(data.uniqueCrawlNames)
  }
  useEffect(() => {
    getInfo()
  }, [])
  return (
    <div className="tab">
     {crawls.map((crawl, index) => (
        <div key={index}>{crawl}</div>
      ))}
    </div>
  )
}
export default Info
