import React, { useState } from "react";
import UseCrawlLog from "./UseCrawlLog";
import "./Enqueue.css";
const Enqueue = () => {
  const [enqueueResult, setEnqueueResult] = useState("");
  const [enqueueInput, setEnqueueInput] = useState("");
  const [crawlName, setCrawlName] = useState("");
  const [maxRequests, setMaxRequests] = useState(-1);
  const [reIndexDuplicates, setReIndexDuplicates] = useState(false);
  const [errors, setErrors] = useState({});

  const { CrawlLog, startLogStream } = UseCrawlLog();

  const validate = () => {
    const errors = {};
    if (!enqueueInput) errors.enqueueInput = "Link is required";
    if (!crawlName) errors.crawlName = "Crawl name is required";
    //if (maxRequests < 1) errors.maxRequests = "Max requests must be greater than 0";
    return errors;
  };

  const handleEnqueueSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setEnqueueResult("Enqueuing...");

    try {
      const response = await fetch("http://localhost:3000/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: [enqueueInput],
          crawlName,
          maxRequests,
          reIndexDuplicates
        })
      });
      const data = await response.json();
      setEnqueueResult(JSON.stringify(data, null, 2));
      if (data.crawlId) {
        startLogStream(data.crawlId);
      }
    } catch (error) {
      setEnqueueResult("<p>An error occurred</p>");
    }
  };

  return (
    <>
      <form onSubmit={handleEnqueueSubmit}>
        <div className="input">
          <input
            type="text"
            id="enqueue-input"
            value={enqueueInput}
            onChange={(e) => setEnqueueInput(e.target.value)}
            placeholder="Link to enqueue"
          />
          <label htmlFor="enqueue-input">Link</label>
          {errors.enqueueInput && <span className="error">{errors.enqueueInput}</span>}
        </div>
        <div className="input">
          <input
            type="text"
            id="crawl-name"
            value={crawlName}
            onChange={(e) => setCrawlName(e.target.value)}
            required
            placeholder="Name of this indexed crawl"
          />
          <label htmlFor="crawl-name">Name of this indexed crawl</label>
          {errors.crawlName && <span className="error">{errors.crawlName}</span>}
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
            value={maxRequests}
            onChange={(e) => setMaxRequests(Number(e.target.value))}
            placeholder="Max requests"
          />
          <label htmlFor="max-requests">Max requests</label>
          {errors.maxRequests && <span className="error">{errors.maxRequests}</span>}
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
          <input
            type="checkbox"
            id="re-index-duplicates"
            checked={reIndexDuplicates}
            onChange={(e) => setReIndexDuplicates(e.target.checked)}
          />
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
    </>
  );
};

export default Enqueue;