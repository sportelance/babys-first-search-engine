import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs/promises';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import enqueueCrawl from './lib/crawl.js';
import { push, search, getUniqueCrawlNames, getStats } from './lib/database.js';
import { createLogEmitter, removeLogEmitter, writeLog } from './lib/log.js';
import { validateEnqueue, validateSearch, validateSubmit } from './lib/validators.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Middleware to enable CORS
app.use(cors());

// Define rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

// Apply the rate limiter to all requests
app.use(limiter);

// Serve static files
app.use('/', express.static('./front-end'));


// Endpoint to submit items to Elasticsearch
app.post("/submit", validateSubmit, async (request, response) => {
  try {
    const { content, href, index, title } = request.body;
    const pushResponse = await push({ content, href, index, title });
    response.status(200).json(pushResponse);
  } catch (error) {
    writeLog("Error indexing document:", error);
    response.status(500).json({ error: "Error indexing document" });
  }
});

// Endpoint to read logs
app.get("/logs", async (request, response) => {
  try {
    const logs = await fs.readFile('logs.txt', 'utf8');
    response.json({ logs });
  } catch {
    response.status(500).json({ error: "Error reading logs" });
  }
});

// Endpoint to enqueue crawl
app.post("/enqueue", validateEnqueue, async (request, response) => {
  const { crawlName, links, maxRequests, reIndexDuplicates } = request.body;

  try {
    const id = await enqueueCrawl({crawlName, links, maxRequests, reIndexDuplicates});
    writeLog("Crawl started successfully");
    response.status(202).json({ crawlId: id, links, message: "Crawl started" });
  } catch (error) {
    writeLog("Failed to start crawl:", error);
    response.status(500).json({ message: `Failed to start crawl: ${error}` });
  }
});

// Endpoint to query Elasticsearch
app.get("/search", validateSearch, async (request, response) => {
  try {
    const { q, p } = request.query;
    const searchResponse = await search(q, p);
    response.status(200).json(searchResponse);
  } catch (error) {
    writeLog("Error searching documents:", error);
    response.status(500).json({ error: "Error searching documents" });
  }
});

app.post("/search", validateSearch, async (request, response) => {
  const { q } = request.body;

  try {
    const searchResponse = await search(q);
    response.status(200).json(searchResponse);
  } catch (error) {
    console.error("Error searching documents:", error);
    response.status(500).json({ error: "Error searching documents" });
  }
});

app.get("/stats",  async (request, response) => {
  
  try {
    const results = await getStats();
    response.status(200).json(results);
  } catch (error) {
    console.error("Error searching documents:", error);
    response.status(500).json({ error: "Error searching documents" });
  }
});
// SSE endpoint for real-time log updates for a specific crawl ID
app.get('/logs/stream/:crawlId', (request, response) => {
  const { crawlId } = request.params;
  const logEmitter = createLogEmitter(crawlId);

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.flushHeaders(); // flush the headers to establish SSE with the client

  const logListener = (log) => {
    response.write(`data: ${JSON.stringify(log)}\n\n`);
  };

  logEmitter.on('log', logListener);

  // Remove listener and emitter on client disconnect
  request.on('close', () => {
    logEmitter.removeListener('log', logListener);
    removeLogEmitter(crawlId);
    response.end();
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});