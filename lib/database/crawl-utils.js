const crawlUtils = (esClient, log, handleError) => {
  // Create a crawl
  const createCrawl = async (crawlId, crawlName, status = "started") => {
    try {
      const response = await esClient.index({
        body: {
          crawlId,
          crawlName,
          date: new Date().toISOString(),
          status
        },
        index: "crawls"
      })
      log.info(`Crawl start saved in db successfully: ${response._id}`)
      return response
    } catch (error) {
      handleError(error, "Error creating crawl")
    }
  }

  // Update a crawl
  const updateCrawl = async (crawlId, status) => {
    try {
      const response = await esClient.update({
        body: {
          doc: { status }
        },
        id: crawlId,
        index: "crawls"
      })
      log.info(`Crawl updated successfully: ${response._id}`)
      return response
    } catch (error) {
      handleError(error, "Error updating crawl")
    }
  }

  // Get all crawls with all fields and documents in the "web" index associated with each crawlId
  const getAllCrawlsWithDocuments = async () => {
    try {
      // Retrieve all crawls with all fields
      const crawlsResponse = await esClient.search({
        index: "crawls",
        body: {
          query: {
            match_all: {}
          },
          size: 10_000 // Adjust this size as needed
        }
      })

      const crawls = crawlsResponse.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source
      }))

      const results = []

      // For each crawl, retrieve associated documents in the "web" index
      for (const crawl of crawls) {
        const webDocumentsResponse = await esClient.search({
          index: "web",
          body: {
            query: {
              term: { "crawlId.keyword": crawl.id }
            },
            size: 10_000 // Adjust this size as needed
          }
        })

        const webDocuments = webDocumentsResponse.hits.hits.map(
          (hit) => hit._source
        )

        results.push({
          crawl,
          webDocuments
        })
      }

      log.info(
        "All crawls with associated web documents retrieved successfully"
      )
      return results
    } catch (error) {
      handleError(error, "Error retrieving all crawls with documents")
    }
  }
    // Get a crawl by its ID
    const getCrawlById = async (crawlId) => {
        try {
          const response = await esClient.search({
            index: "crawls",
            query: {
              match: {
                crawlId: crawlId
              }
            }
          })
          
          return response
        } catch (error) {
          handleError(error, `Error retrieving crawl with ID: ${crawlId}`)
        }
      }
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
        index: "web"
      })
      const uniqueCrawlNames =
        response.aggregations.unique_crawlNames.buckets.map(
          (bucket) => bucket.key
        )
      log.info("Unique crawlNames retrieved successfully")
      return uniqueCrawlNames
    } catch (error) {
      handleError(error, "Error retrieving unique crawlNames")
    }
  }
  return {
    createCrawl,
    updateCrawl,
    getAllCrawlsWithDocuments,
    getUniqueCrawlNames,
    getCrawlById
  }
}
export default crawlUtils
