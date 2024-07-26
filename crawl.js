import { PuppeteerCrawler, Dataset } from "@crawlee/puppeteer"
import { push } from "./db.js"
import { writeLog } from "./log.js"
import getMeta from "./meta.js"

const enqueueCrawl = async (links, crawlName) => {
  writeLog("Starting crawl for links: ", links)
  const crawler = new PuppeteerCrawler({
    async requestHandler({ request, enqueueLinks, page }) {
      const data = await page.evaluate(
        () => document.querySelector("*").outerHTML
      )
      let meta = await getMeta(request.url, data);
 
      var url = request.url
      writeLog(`Crawling URL: ${request.url}`)

      const pageTitle = await page.title()
      const pageContent = await page.content()

      const doc = {
        crawlName: crawlName,
        href: request.url,
        title: pageTitle,
        content: pageContent,
        meta: meta,
        html: data
      }

      try {
        await push(doc)
        writeLog(`Successfully indexed: ${url}`)
      } catch (error) {
        writeLog(`Failed to index: ${url} - ${error.message}`)
      }

      await enqueueLinks() // Enqueue all links found on the page
    },
    failedRequestHandler({ request, log }) {
      writeLog(`Request ${request.url()} failed twice.`)
    }
  })

  // Run the crawler with the initial request
  crawler.run(links)

  return;
}

export default enqueueCrawl
