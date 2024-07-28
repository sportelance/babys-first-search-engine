import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs/promises';

import enqueueCrawl from './lib/crawl.js';
import { push, search } from './lib/db.js';
import { createLogEmitter, removeLogEmitter,writeLog } from './lib/log.js';
import { validateEnqueue, validateSearch, validateSubmit } from './lib/validators.js';
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());


// Serve static files
app.use('/assets', express.static('./assets'));

// Serve index.html
app.get("/", async (request, res) => {
  try {
    const htmlContent = await fs.readFile('index.html', 'utf8');
    res.header('Content-Type', 'text/html').send(htmlContent);
  } catch {
    res.status(500).send("Error reading index.html");
  }
});

// Endpoint to submit items to Elasticsearch
app.post("/submit", validateSubmit, async (request, res) => {
  try {
    const { content, href, index, title } = request.body;
    let response = await push({ content, href, index, title });
    res.status(200).json(response);
  } catch (error) {
    writeLog("Error indexing document:", error);
    res.status(500).json({ error: "Error indexing document" });
  }
});

// Endpoint to read logs
app.get("/logs", async (request, res) => {
  try {
    const logs = await fs.readFile('logs.txt', 'utf8');
    res.json({ logs });
  } catch {
    res.status(500).json({ error: "Error reading logs" });
  }
});

// Endpoint to enqueue crawl
app.post("/enqueue", validateEnqueue, async (request, res) => {
  const { crawlName, links } = request.body;

  try {
    let id = await enqueueCrawl(links, crawlName);
    writeLog("Crawl started successfully");
    res.status(202).json({ crawlId: id, links, message: "Crawl started" });
  } catch (error) {
    writeLog("Failed to start crawl:", error);
    res.status(500).json({ message: `Failed to start crawl: ${error}` });
  }
});

// Endpoint to query Elasticsearch
app.get("/search", validateSearch, async (request, res) => {
  try {
    const { q } = request.query;
    let response = await search(q);
    res.status(200).json(response.body.hits.hits);
  } catch (error) {
    writeLog("Error searching documents:", error);
    res.status(500).json({ error: "Error searching documents" });
  }
});

app.post("/search", validateSearch, async (request, res) => {
  const { q } = request.body;

  try {
    let response = await search(q);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error searching documents:", error);
    res.status(500).json({ error: "Error searching documents" });
  }
});
// SSE endpoint for real-time log updates for a specific crawl ID
app.get('/logs/stream/:crawlId', (request, res) => {
  const { crawlId } = request.params;
  const logEmitter = createLogEmitter(crawlId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with the client

  const logListener = (log) => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  };

  logEmitter.on('log', logListener);

  // Remove listener and emitter on client disconnect
  request.on('close', () => {
    logEmitter.removeListener('log', logListener);
    removeLogEmitter(crawlId);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});