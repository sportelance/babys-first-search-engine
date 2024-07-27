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
const push = async (doc) => {
  try {
    const response = await esClient.index({
      index: "web",
      document: doc,
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
  try {
    const from = (page - 1) * size;
    const response = await esClient.search({
      index: "web",
      body: {
        query: {
          multi_match: {
            query,
            fuzziness: "AUTO",
            fields: ["title", "content", "href"], // Include the fields you want to search
          },
        },
        from,
        size,
      },
    });
    writeLog(`Search query executed successfully`);
    const totalResults = response.hits.total.value;
    const totalPages = Math.ceil(totalResults / size);
    return {
      results: response.hits.hits.map((hit) => hit._source), // Extract the source documents from the response
      totalResults,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    writeLog(`Error searching documents: ${error}`);
    throw error;
  }
};

// Update a document
const update = async (id, doc) => {
  try {
    const response = await esClient.update({
      index: "web",
      id,
      body: {
        doc,
      },
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
      index: "web",
      id,
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

// Ensure connection is healthy at startup
(async () => {
  await checkConnection();
})();

export { push, search, update, remove, getTotalDocuments };