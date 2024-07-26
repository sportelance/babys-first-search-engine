import { PuppeteerCrawler, Dataset } from "@crawlee/puppeteer"
import { push } from "./db.js"
import { writeLog } from "./log.js"


const enqueueCrawl = async (links) => {
  writeLog("Starting crawl for links: ", links)
  const crawler = new PuppeteerCrawler({
    async requestHandler({ request, enqueueLinks, page }) {
      const data = await page.evaluate(
        () => document.querySelector("*").outerHTML
      )
      var url = request.url
      writeLog.info(`Crawling URL: ${request.url}`)

      const pageTitle = await page.title()
      const pageContent = await page.content()

      const doc = {
        href: request.url,
        title: pageTitle,
        content: pageContent,
        html: data
      }

      try {
        await push(doc)
        writeLog.info(`Successfully indexed: ${url}`)
      } catch (error) {
        writeLog.error(`Failed to index: ${url} - ${error.message}`)
      }

      await enqueueLinks() // Enqueue all links found on the page
    },
    failedRequestHandler({ request, log }) {
      log.error(`Request ${request.url()} failed twice.`)
    }
  })

  // Run the crawler with the initial request
  await crawler.run(links)
}

export default enqueueCrawl
