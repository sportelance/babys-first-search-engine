import React, { useState, useRef, useCallback, useEffect } from "react"
import UseCrawlLog from "./UseCrawlLog"

import EnqueueForm from "./EnqueueForm"
import "./Enqueue.css"
const Enqueue = ({popNotification}) => {
  const [enqueueResult, setEnqueueResult] = useState("")
  const [enqueueInput, setEnqueueInput] = useState("")
  const [crawlName, setCrawlName] = useState("")
  const [maxRequests, setMaxRequests] = useState(-1)
  const [reIndexDuplicates, setReIndexDuplicates] = useState(false)
  const [errors, setErrors] = useState({})
  const [crawlSitemap, setCrawlSitemap] = useState(false)
  const textareaRef = useRef(null)


  const { CrawlLog, startLogStream } = UseCrawlLog()


  const handleEnqueueSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setEnqueueResult("Enqueuing...")

    try {
      let parsedLinks = enqueueInput.split("\n").map((link) => link.trim())
      const response = await fetch("http://localhost:3000/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: parsedLinks,
          crawlName,
          maxRequests,
          reIndexDuplicates
        })
      })
      const data = await response.json()
      popNotification(JSON.stringify(data, null, 2))
      if (data.crawlId) {
        startLogStream(data.crawlId)
      }
    } catch (error) {
      popNotification("<p>An error occurred</p>")
    }
  }

  return (
    <>
    <EnqueueForm onSubmit={handleEnqueueSubmit} />
     
      <CrawlLog />
    </>
  )
}

export default Enqueue
