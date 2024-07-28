import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

import { writeLog } from './log.js';

// Load environment variables from .env file
dotenv.config();

// Elasticsearch client setup
const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE });

// Check connection health
const checkConnection = async () => {
  try {
    const health = await esClient.cluster.health({});
    if (health.status !== 'green' && health.status !== 'yellow') {
      throw new Error(`Elasticsearch cluster health is ${health.status}`);
    }
    writeLog('Elasticsearch cluster is healthy');
  } catch (error) {
    writeLog(`Elasticsearch connection error: ${error}`);
    throw error;
  }
};

// Index a document
const push = async (document) => {
  try {
    const response = await esClient.index({
      document,
      index: "web",
    });
    writeLog(`Document indexed successfully: ${response._id}`);
    return response;
  } catch (error) {
    writeLog(`Error indexing document: ${error}`);
    throw error;
  }
};

// Search documents with pagination
const search = async (query, page = 1, size = 10) => {
//  try {
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
    console.log(response);
    writeLog(`Search query for ${query} on page ${page} executed successfully`);
    const totalResults = response.hits.total.value;
    const totalPages = Math.ceil(totalResults / size);
    return {
      currentPage: page,
      results: response.hits.hits.map((hit) => hit._source), // Extract the source documents from the response
      totalPages,
      totalResults,
    };
 // } catch (error) {
 //   writeLog(`Error searching documents: ${error}`);
 //   throw error;
 // }
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
    writeLog(`Document updated successfully: ${response._id}`);
    return response;
  } catch (error) {
    writeLog(`Error updating document: ${error}`);
    throw error;
  }
};

// Delete a document
const remove = async (id) => {
  try {
    const response = await esClient.delete({
      id,
      index: "web",
    });
    writeLog(`Document deleted successfully: ${response._id}`);
    return response;
  } catch (error) {
    writeLog(`Error deleting document: ${error}`);
    throw error;
  }
};

// Get total number of documents
const getTotalDocuments = async () => {
  try {
    const response = await esClient.count({ index: 'web' });
    writeLog('Total document count retrieved successfully');
    return response.count;
  } catch (error) {
    writeLog(`Error retrieving total document count: ${error}`);
    throw error;
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
              size: 10_000 // Increase if more unique values are expected
            }
          }
        },
        size: 0
      },
      index: "web",
    });
    const uniqueCrawlNames = response.aggregations.unique_crawlNames.buckets.map(bucket => bucket.key);
    writeLog('Unique crawlNames retrieved successfully');
    return uniqueCrawlNames;
  } catch (error) {
    writeLog(`Error retrieving unique crawlNames: ${error}`);
    throw error;
  }
};

// Check if URL exists
const urlExists = async (url) => {
  try {
    const response = await esClient.search({
      body: {
        query: {
          term: {
            href: url,
          },
        },
        size: 1,
      },
      index: "web",
    });
    const exists = response.hits.total.value > 0;
    writeLog(`URL existence check completed: ${exists}`);
    return exists;
  } catch (error) {
    writeLog(`Error checking URL existence: ${error}`);
    throw error;
  }
};

// Ensure connection is healthy at startup
(async () => {
  await checkConnection();
})();

export { getTotalDocuments, getUniqueCrawlNames, push, remove, search, update, urlExists };