
import { serve } from "@hono/node-server"
import dotenv from "dotenv"
import { Hono } from "hono"
import fs from "node:fs/promises"
import {writeLog} from "./log.js"
import enqueueCrawl from "./crawl.js"
import { push, search } from "./db.js"
import { serveStatic } from '@hono/node-server/serve-static'


// Load environment variables from .env file
dotenv.config()

const app = new Hono()


// Middleware
app.use(async (c, next) => {
  await next()
  //c.header("Content-Type", "application/json")
})

app.get("/", async(c) => {
  const htmlContent = await fs.readFile('index.html', 'utf8');
    c.header('Content-Type', 'text/html');
    return c.html(htmlContent);
})
app.use('/assets', serveStatic({ root: './assets' }))

// Endpoint to submit items to Elasticsearch
app.post("/submit", async (c) => {
  try {
    const { content, href, index, title } = await c.req.json()
    let response = await push({ content, href, index, title })
    return c.json(response, 200)
  } catch (error) {
    writeLog("Error indexing document:", error)
    return c.json({ error: "Error indexing document" }, 500)
  }
})
app.get("/logs", async (c) => {
  const logs = await fs.readFile('logs.txt', 'utf8');
  return c.json({logs})
})
// Endpoint to enqueue crawl
app.post("/enqueue", async (c) => {
  const { links } = await c.req.json()

  if (!Array.isArray(links) || links.length === 0) {
    return c.json({ message: "Invalid links array" }, 400)
  }

  try {
    await enqueueCrawl(links)
    writeLog("Crawl started successfully")
    return c.json({ links, message: "Crawl started" }, 202)
  } catch (error) {
    writeLog("Failed to start crawl:", error)
    return c.json({ message: "Failed to start crawl" }, 500)
  }
})

// Endpoint to query Elasticsearch
app.get("/search", async (c) => {
  try {
    const { q } = c.req.query
    let response = await search(q)
    return c.json(response.body.hits.hits, 200)
  } catch (error) {
    writeLog("Error searching documents:", error)
    return c.json({ error: "Error searching documents" }, 500)
  }
})

app.post("/search", async (c) => {
  const { q } = await c.req.json()

  try {
    let response = await search(q)
    return c.json(response, 200)
  } catch (error) {
    console.error("Error searching documents:", error)
    return c.json({ error: "Error searching documents" }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
})
