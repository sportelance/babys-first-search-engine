import { Client } from "@elastic/elasticsearch"

import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Elasticsearch client setup
const esClient = new Client({ node: process.env.ELASTICSEARCH_NODE })

const push = async (doc) => {
  try {
    const response = await esClient.index({
      index: "web",

      document: doc
    })
    return response
  } catch (error) {
    console.error("Error indexing elastic document:", error)
    throw error
  }
}
const search = async (query) => {
  const response = await esClient.search({
    index: "web",
    body: {
      query: {
        multi_match: {
          query,
          fuzziness: "AUTO",
          fields: ["title", "content", "href"] // Include the fields you want to search
        }
      }
    }
  })
  return response.hits.hits.map((hit) => hit._source) // Extract the source documents from the response
}
export { push, search }
