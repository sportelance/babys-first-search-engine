import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

import { log } from './log.js';

// Load environment variables from .env file
dotenv.config();

// Elasticsearch client setup
const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE });

// Centralized error handling and logging
const handleError = (error, context) => {
  log.warn(`${context}: ${error.message}`);
  //throw error;
};

// Check connection health with retry logic
const checkConnection = async () => {
  let connected = false;
  while (!connected) {
    try {
      const health = await esClient.cluster.health({});
      if (health.status !== 'green' && health.status !== 'yellow') {
        throw new Error(`Elasticsearch cluster health is ${health.status}`);
      }
      log.info('Elasticsearch cluster is healthy');
      connected = true;
    } catch {
      log.error('Failed to connect to Elasticsearch. Retrying...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }
};

// Gracefully close the Elasticsearch client connection
const gracefulShutdown = async () => {
  log.info('Closing Elasticsearch client...');
  await esClient.close();
  log.info('Elasticsearch client closed successfully.');
  process.exit(0);
};

// Register process event listeners for graceful shutdown
process.on('SIGINT', gracefulShutdown);   // For Ctrl+C in terminal
process.on('SIGTERM', gracefulShutdown);  // For termination signals
process.on('exit', gracefulShutdown);     // For process exit

// Index a document
const push = async (document) => {
  try {
    const response = await esClient.index({
      document,
      index: "web",
    });
    log.info(`Document indexed successfully: ${response._id}`);
    return response;
  } catch (error) {
    handleError(error, 'Error indexing document');
  }
};

// Search documents with pagination
const search = async (query, page = 1, size = 10) => {
  try {
    const from = (page - 1) * size;
    const response = await esClient.search({
      body: {
        from,
        query: {
          multi_match: {
            fields: ["title", "href"],
            fuzziness: "AUTO",
            query,
          },
        },
        size,
      },
      index: "web",
    });
    log.info(`Search query for ${query} on page ${page} executed successfully`);
    const totalResults = response.hits.total.value;
    const totalPages = Math.ceil(totalResults / size);
    return {
      currentPage: page,
      results: response.hits.hits.map((hit) => hit._source),
      totalPages,
      totalResults,
    };
  } catch (error) {
    handleError(error, 'Error searching documents');
  }
};

// Create a crawl
const createCrawl = async (crawlId, crawlName, status = 'started') => {
  try {
    const response = await esClient.index({
      body: {
        crawlId,
        crawlName,
        date: new Date().toISOString(),
        status,
      },
      index: "crawls",
    });
    log.info(`Crawl created successfully: ${response._id}`);
    return response;
  } catch (error) {
    handleError(error, 'Error creating crawl');
  }
};

// Update a crawl
const updateCrawl = async (crawlId, status) => {
  try {
    const response = await esClient.update({
      body: {
        doc: { status },
      },
      id: crawlId,
      index: "crawls",
    });
    log.info(`Crawl updated successfully: ${response._id}`);
    return response;
  } catch (error) {
    handleError(error, 'Error updating crawl');
  }
};

// Update a document
const update = async (id, document) => {
  try {
    const response = await esClient.update({
      body: {
        doc: document,
      },
      id,
      index: "web",
    });
    log.info(`Document updated successfully: ${response._id}`);
    return response;
  } catch (error) {
    handleError(error, 'Error updating document');
  }
};

// Delete a document
const remove = async (id) => {
  try {
    const response = await esClient.delete({
      id,
      index: "web",
    });
    log.info(`Document deleted successfully: ${response._id}`);
    return response;
  } catch (error) {
    handleError(error, 'Error deleting document');
  }
};

// Get total number of documents
const getTotalDocuments = async () => {
  try {
    const response = await esClient.count({ index: 'web' });
    log.info('Total document count retrieved successfully');
    return response.count;
  } catch (error) {
    handleError(error, 'Error retrieving total document count');
  }
};

// Get all unique crawlName keys
const getUniqueCrawlNames = async () => {
  try {
    const response = await esClient.search({
      body: {
        aggs: {
          unique_crawlNames: {
            terms: {
              field: "crawlName.keyword",
              size: 10_000, // Increase if more unique values are expected
            },
          },
        },
        size: 0,
      },
      index: "web",
    });
    const uniqueCrawlNames = response.aggregations.unique_crawlNames.buckets.map(bucket => bucket.key);
    log.info('Unique crawlNames retrieved successfully');
    return uniqueCrawlNames;
  } catch (error) {
    handleError(error, 'Error retrieving unique crawlNames');
  }
};

// Get stats
const getStats = async () => {
  try {
    const [uniqueCrawlNames, totalDocuments] = await Promise.all([
      getUniqueCrawlNames(),
      getTotalDocuments(),
    ]);
    return { totalDocuments, uniqueCrawlNames };
  } catch (error) {
    handleError(error, 'Error retrieving stats');
  }
};

// Get total disk size
async function getTotalDiskSize() {
  try {
    const response = await esClient.cat.indices({
      bytes: 'b', // Size in bytes
      format: 'json'
    });

    const totalSize = response.body.reduce((accumulator, index) => {
      return accumulator + Number.parseInt(index['store.size']);
    }, 0);

    return totalSize;
  } catch (error) {
    console.error('Error fetching indices:', error);
    throw error;
  }
}

// Ensure index exists
const ensureIndexExists = async (index) => {
  try {
    const { body: exists } = await esClient.indices.exists({ index });
    if (!exists) {
      await esClient.indices.create({ index });
      log.info(`Index "${index}" created successfully`);
    }
  } catch (error) {
    handleError(error, `Error ensuring index "${index}" exists`);
  }
};

// Check if URL exists
const urlExists = async (url) => {
  try {
    const response = await esClient.search({
      body: {
        query: {
          term: { href: url },
        },
        size: 1,
      },
      index: "web",
    });
    const exists = response.hits.total.value > 0;
    log.info(`URL existence check completed: ${exists}`);
    return exists;
  } catch (error) {
    handleError(error, 'Error checking URL existence');
  }
};

// Ensure connection is healthy at startup
(async () => {
  await checkConnection();
  await ensureIndexExists('web');
  await ensureIndexExists('crawls');
})();

export {
  createCrawl,
  getStats,
  getTotalDocuments,
  getUniqueCrawlNames,
  push,
  remove,
  search,
  update,
  updateCrawl,
  urlExists,
};