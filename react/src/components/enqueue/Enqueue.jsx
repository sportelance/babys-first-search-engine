import React, { useState, useRef, useCallback, useEffect } from "react"
import UseCrawlLog from "./UseCrawlLog"

import EnqueueForm from "./EnqueueForm"
import "./Enqueue.scss"
const Enqueue = ({notify}) => {



  const { CrawlLog, startLogStream } = UseCrawlLog()


  const handleEnqueueSubmit = async (formData) => {

    /*
    {
    "maxDepth": -1,
    "maxRequests": 2,
    "maxTime": -1,
    "logLevel": "INFO",
    "fields": {
        "title": true,
        "description": true,
        "images": true,
        "publisher": true,
        "date": true,
        "url": true,
        "logo": true
    },
    "links": "http://www.example.com",
    "crawlName": "example1",
    "crawlSitemap": true
} */
   // e.preventDefault()


    //setEnqueueResult("Enqueuing...")

    try {
      
      const response = await fetch("http://localhost:3000/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      notify(JSON.stringify(data, null, 2))
      if (data.crawlId) {
        startLogStream(data.crawlId)
      }
    } catch (error) {
      notify("<p>An error occurred</p>")
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
