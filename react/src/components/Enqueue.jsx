import react, { useState } from "react"
import UseCrawlLog from "./UseCrawlLog"
const Enqueue = () => {
  const [enqueueResult, setEnqueueResult] = useState("")

  const { CrawlLog, startLogStream } = UseCrawlLog()

  const handleEnqueueSubmit = async (e) => {
    e.preventDefault()
    setEnqueueResult("Enqueuing...")

    const enqueueInput = document.getElementById("enqueue-input").value
    const crawlName = document.getElementById("crawl-name").value
    const maxRequests = document.getElementById("max-requests").value
    const reIndexDuplicates = document.getElementById(
      "re-index-duplicates"
    ).checked

    try {
      const response = await fetch("/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: [enqueueInput],
          crawlName,
          maxRequests,
          reIndexDuplicates
        })
      })
      const data = await response.json()
      setEnqueueResult(JSON.stringify(data, null, 2))
      if (data.crawlId) {
        startLogStream(data.crawlId)
      }
    } catch (error) {
      setEnqueueResult("<p>An error occurred</p>")
    }
  }

  return (
    <div className="tab">
      <form onSubmit={handleEnqueueSubmit}>
        <div className="input">
          <input type="text" id="enqueue-input" placeholder="Link to enqueue" />
          <label htmlFor="enqueue-input">Link</label>
        </div>
        <div className="input">
          <input
            type="text"
            id="crawl-name"
            required
            placeholder="Name of this indexed crawl"
          />
          <label htmlFor="crawl-name">Name of this indexed crawl</label>
        </div>
        <div className="input">
          <input
            type="number"
            id="max-depth"
            defaultValue="-1"
            placeholder="Max depth"
          />
          <label htmlFor="max-depth">Max depth</label>
        </div>
        <div className="input">
          <input
            type="number"
            id="max-requests"
            defaultValue="-1"
            placeholder="Max requests"
          />
          <label htmlFor="max-requests">Max requests</label>
        </div>
        <div className="input">
          <input
            type="number"
            id="max-time"
            defaultValue="-1"
            placeholder="Max time"
          />
          <label htmlFor="max-time">Max time</label>
        </div>
        <div className="input">
          <input type="checkbox" id="re-index-duplicates" />
          <label htmlFor="re-index-duplicates">Re-index duplicates?</label>
        </div>
        <button type="submit">Enqueue</button>
      </form>
      <div>
        <span>Enqueuing result</span>
        <code className="language-json">
          <pre>{enqueueResult}</pre>
        </code>
      </div>
      <CrawlLog />
    </div>
  )
}

export default Enqueue
