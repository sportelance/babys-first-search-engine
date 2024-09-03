import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import fs from "node:fs/promises"

import enqueueCrawl from "./lib/crawl.js"
import { getStats, push, search, getAllCrawlswithDocuments } from "./lib/database.js"
import { createLogEmitter, removeLogEmitter, log } from "./lib/log.js"
import {
  errorHandler,
  notFoundHandler
} from "./lib/middlewares/error-handlers.js"
import {
  validateEnqueue,
  validateSearch,
  validateSubmit
} from "./lib/validators.js"

// Load environment variables from .env file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Combined middleware
app.use([express.json(), cors(), errorHandler])

// Define rate limiter
const limiter = rateLimit({
  max: 100,
  message: "You've been ratelimited, motherfucker",
  windowMs: 15 * 60 * 1000
})

// Serve static files with cache control
app.use(
  "/",
  express.static("./front-end", {
    maxAge: "1d"
  })
)

// Endpoint to submit items to Elasticsearch
app.post("/submit", validateSubmit, async (request, response) => {
  try {
    const { content, href, index, title } = request.body
    const pushResponse = await push({ content, href, index, title })
    response.status(200).json(pushResponse)
  } catch (error) {
    log.error("Error indexing document:", error)
    response.status(500).json({ error: "Error indexing document" })
  }
})

// Endpoint to read logs
app.get("/logs", async (request, response) => {
  try {
    const logs = await fs.readFile("logs.txt", "utf8")
    response.json({ logs })
  } catch {
    response.status(500).json({ error: "Error reading logs" })
  }
})

// Endpoint to enqueue crawl
app.post("/enqueue", validateEnqueue, async (request, response) => {
  const id = await enqueueCrawl(request.body)
  log.info("Crawl started successfully")
  response.status(202).json({ crawlId: id, message: "Crawl started" })
})

// Endpoint to query Elasticsearch
app.get("/search", validateSearch, limiter, async (request, response) => {
  try {
    const { p, q } = request.query
    const searchResponse = await search(q, p)
    response.status(200).json(searchResponse)
  } catch (error) {
    log.error("Error searching documents:", error)
    response.status(500).json({ error: "Error searching documents" })
  }
})
app.get("/alive", (request, response) => {
  response.status(200).json({ alive: true })
})
app.get("/stats", async (request, response) => {
  try {
    const results = await getStats()
    response.status(200).json(results)
  } catch (error) {
    console.error("Error getting stats:", error)
    response.status(500).json({ error: "Error getting stats" })
  }
})
app.get("/crawls", async (request, response) => {
  try {
    const results = await getAllCrawlswithDocuments()
    response.status(200).json(results)
  } catch (error) {
    console.error("Error getting crawls:", error)
    response.status(500).json({ error: "Error getting crawls" })
  }
})
// SSE endpoint for real-time log updates for a specific crawl ID
app.get("/logs/stream/:crawlId", (request, response) => {
  const { crawlId } = request.params
  const logEmitter = createLogEmitter(crawlId)

  response.setHeader("Content-Type", "text/event-stream")
  response.setHeader("Cache-Control", "no-cache")
  response.setHeader("Connection", "keep-alive")
  response.flushHeaders() // flush the headers to establish SSE with the client

  const logListener = (log) => {
    response.write(`data: ${JSON.stringify(log)}\n\n`)
  }

  logEmitter.on("log", logListener)

  // Remove listener and emitter on client disconnect
  request.on("close", () => {
    logEmitter.removeListener("log", logListener)
    removeLogEmitter(crawlId)
    response.end()
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
