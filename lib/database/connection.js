function connection(esClient, log) {
  // Check connection health with retry logic
  const checkConnection = async () => {
    let connected = false
    while (!connected) {
      try {
        const health = await esClient.cluster.health({})
        if (health.status !== "green" && health.status !== "yellow") {
          throw new Error(`Elasticsearch cluster health is ${health.status}`)
        }
        log.info("Elasticsearch cluster is healthy")
        connected = true
      } catch {
        log.error("Failed to connect to Elasticsearch. Retrying...")
        await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait for 5 seconds before retrying
      }
    }
  }

  // Gracefully close the Elasticsearch client connection
  const gracefulShutdown = async () => {
    log.info("Closing Elasticsearch client...")
    await esClient.close()
    log.info("Elasticsearch client closed successfully.")
    process.exit(0)
  }

  // Register process event listeners for graceful shutdown
  process.on("SIGINT", gracefulShutdown) // For Ctrl+C in terminal
  process.on("SIGTERM", gracefulShutdown) // For termination signals
  process.on("exit", gracefulShutdown) // For process exit

  return { checkConnection, gracefulShutdown }
}
export default connection