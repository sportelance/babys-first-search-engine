import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import enqueueCrawl from './lib/crawl.js';
import { push, search, getCrawlById } from './lib/database.js';
import { createLogEmitter, removeLogEmitter, log } from './lib/log.js';
import {
  errorHandler,
  notFoundHandler
} from './lib/middlewares/error-handlers.js';
import {
  validateEnqueue,
  validateSearch,
  validateSubmit
} from './lib/validators.js';

// Load environment variables from .env file
dotenv.config();

const fastify = Fastify();
const PORT = process.env.PORT || 3000;


await fastify.register(fastifyCors);
await fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '15 minutes',
  errorResponseBuilder: () => ({
    code: 429,
    error: "Too Many Requests",
    message: "You've been ratelimited, motherfucker"
  })
});

// Serve static files with cache control
fastify.register(import('@fastify/static'), {
  root: path.resolve('./front-end'),
  prefix: '/',
  maxAge: '1d'
});

// Error handler middleware
fastify.setErrorHandler(errorHandler);

// Not found handler
fastify.setNotFoundHandler(notFoundHandler);

// Endpoint to submit items to Elasticsearch
fastify.post('/submit', { schema: validateSubmit }, async (request, reply) => {
  try {
    const { content, href, index, title } = request.body;
    const pushResponse = await push({ content, href, index, title });
    reply.status(200).send(pushResponse);
  } catch (error) {
    log.error('Error indexing document:', error);
    reply.status(500).send({ error: 'Error indexing document' });
  }
});

// Endpoint to read logs
fastify.get('/logs', async (request, reply) => {
  try {
    const logs = await fs.readFile('logs.txt', 'utf8');
    reply.send({ logs });
  } catch {
    reply.status(500).send({ error: 'Error reading logs' });
  }
});

// Endpoint to enqueue crawl
fastify.post('/enqueue', { schema: validateEnqueue }, async (request, reply) => {
  const id = await enqueueCrawl(request.body);
  log.info('Crawl started successfully');
  reply.status(202).send({ crawlId: id, message: 'Crawl started' });
});

// Endpoint to query Elasticsearch
fastify.get('/search', { schema: validateSearch }, async (request, reply) => {
  try {
    const { p, q } = request.query;
    const searchResponse = await search(q, p);
    reply.status(200).send(searchResponse);
  } catch (error) {
    log.error('Error searching documents:', error);
    reply.status(500).send({ error: 'Error searching documents' });
  }
});

fastify.get('/alive', async (request, reply) => {
  reply.status(200).send({ alive: true });
});



fastify.get('/crawls/:crawlId', async (request, reply) => {

  const { crawlId } = request.params;
  console.log(crawlId);
  const crawl = await getCrawlById(crawlId);
  if (!crawl) {
    reply.status(404).send({ error: 'Crawl not found' });
  } else {
    reply.status(200).send(crawl);
  }
});
// SSE endpoint for real-time log updates for a specific crawl ID
fastify.get('/logs/stream/:crawlId', async (request, reply) => {
  const { crawlId } = request.params;
  const logEmitter = createLogEmitter(crawlId);

  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.flushHeaders();

  const logListener = (log) => {
    reply.raw.write(`data: ${JSON.stringify(log)}\n\n`);
  };

  logEmitter.on('log', logListener);

  // Remove listener and emitter on client disconnect
  request.raw.on('close', () => {
    logEmitter.removeListener('log', logListener);
    removeLogEmitter(crawlId);
    reply.raw.end();
  });
});

// Start server
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
  console.log(`Server is running on ${address}`);
});