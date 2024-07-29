import { PuppeteerCrawler } from "@crawlee/puppeteer"
import { EnqueueStrategy } from "crawlee"
import dotenv from "dotenv"
import { nanoid } from "nanoid"

import { createCrawl, push, urlExists } from "./database.js"
import { writeLog } from "./log.js"
import getMeta from "./meta.js"
dotenv.config()

const enqueueCrawl = async ({
  crawlName,
  links,
  maxRequests = -1,
  reIndexDuplicates = false
}) => {
  if (!Array.isArray(links) || links.length === 0) {
    throw new Error("Invalid input: 'links' should be a non-empty array.")
  }
  if (typeof crawlName !== "string" || crawlName.trim() === "") {
    throw new Error("Invalid input: 'crawlName' should be a non-empty string.")
  }
  const crawlId = nanoid()
  await createCrawl(crawlId, crawlName)
  writeLog("Starting crawl for links: ", links, crawlId)

  var options = {
    failedRequestHandler: ({ request }) => {
      writeLog(`Request ${request.url()} failed twice.`)
    },
    maxConcurrency: process.env.CRAWLER_MAX_CONCURRENCY || 5,
    requestHandler: async ({ enqueueLinks, page, request }) => {
      try {
        writeLog(`Crawling URL: ${request.url}`, crawlId)

        const data = await page.evaluate(
          () => document.querySelector("*").outerHTML
        )
        const meta = await getMeta(request.url, data)
        const pageTitle = await page.title()
        const pageContent = await page.content()

        const document_ = {
          content: pageContent,
          crawlId,
          crawlName,
          href: request.url,
          html: data,
          meta,
          title: pageTitle
        }

        await push(document_)
        writeLog(`Successfully indexed: ${request.url}`, crawlId)

        await enqueueLinks({
          strategy: EnqueueStrategy.SameDomain
          
        })
      } catch (error) {
        writeLog(`Error processing ${request.url}: ${error}`, crawlId, "error")
      }
    }
    // requestTimeoutSecs: process.env.CRAWLER_REQUEST_TIMEOUT || 30,
  }
  if (maxRequests > 0) {
    options.maxRequestsPerCrawl = maxRequests
  }
  const crawler = new PuppeteerCrawler(options)

  crawler.run(links)
  writeLog("Crawl begun", crawlId)

  return crawlId
}

export default enqueueCrawl
