const webUtilities = (esClient, log, handleError) => {
  // Index a document
  const push = async (document) => {
    try {
      const response = await esClient.index({
        document,
        index: "web"
      })
      log.info(`Document indexed successfully: ${response._id}`)
      return response
    } catch (error) {
      handleError(error, "Error indexing document")
    }
  }
  // Delete a document
  const remove = async (id) => {
    try {
      const response = await esClient.delete({
        id,
        index: "web"
      })
      log.info(`Document deleted successfully: ${response._id}`)
      return response
    } catch (error) {
      handleError(error, "Error deleting document")
    }
  }
  // Search documents with pagination
  const search = async (query, page = 1, size = 10) => {
    try {
      const from = (page - 1) * size
      const response = await esClient.search({
        body: {
          from,
          query: {
            multi_match: {
              fields: ["title", "href"],
              fuzziness: "AUTO",
              query
            }
          },
          size
        },
        index: "web"
      })
      log.info(
        `Search query for ${query} on page ${page} executed successfully`
      )
      const totalResults = response.hits.total.value
      const totalPages = Math.ceil(totalResults / size)
      return {
        currentPage: page,
        results: response.hits.hits.map((hit) => hit._source),
        totalPages,
        totalResults
      }
    } catch (error) {
      handleError(error, "Error searching documents")
    }
  }
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
  // Update a document
  const update = async (id, document) => {
    try {
      const response = await esClient.update({
        body: {
          doc: document
        },
        id,
        index: "web"
      })
      log.info(`Document updated successfully: ${response._id}`)
      return response
    } catch (error) {
      handleError(error, "Error updating document")
    }
  }
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
  return { push, search, remove, update, getTotalDocuments, urlExists }
}
export default webUtilities
