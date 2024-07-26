import express from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import { writeLog } from './log.js';
import enqueueCrawl from './crawl.js';
import { push, search } from './db.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use('/assets', express.static('./assets'));

// Serve index.html
app.get("/", async (req, res) => {
  try {
    const htmlContent = await fs.readFile('index.html', 'utf8');
    res.header('Content-Type', 'text/html').send(htmlContent);
  } catch (error) {
    res.status(500).send("Error reading index.html");
  }
});

// Endpoint to submit items to Elasticsearch
app.post("/submit", async (req, res) => {
  try {
    const { content, href, index, title } = req.body;
    let response = await push({ content, href, index, title });
    res.status(200).json(response);
  } catch (error) {
    writeLog("Error indexing document:", error);
    res.status(500).json({ error: "Error indexing document" });
  }
});

// Endpoint to read logs
app.get("/logs", async (req, res) => {
  try {
    const logs = await fs.readFile('logs.txt', 'utf8');
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: "Error reading logs" });
  }
});

// Endpoint to enqueue crawl
app.post("/enqueue", async (req, res) => {
  const { links, crawlName } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ message: "Invalid links array" });
  }

  try {
    await enqueueCrawl(links, crawlName);
    writeLog("Crawl started successfully");
    res.status(202).json({ links, message: "Crawl started" });
  } catch (error) {
    writeLog("Failed to start crawl:", error);
    res.status(500).json({ message: "Failed to start crawl" });
  }
});

// Endpoint to query Elasticsearch
app.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    let response = await search(q);
    res.status(200).json(response.body.hits.hits);
  } catch (error) {
    writeLog("Error searching documents:", error);
    res.status(500).json({ error: "Error searching documents" });
  }
});

app.post("/search", async (req, res) => {
  const { q } = req.body;

  try {
    let response = await search(q);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error searching documents:", error);
    res.status(500).json({ error: "Error searching documents" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});