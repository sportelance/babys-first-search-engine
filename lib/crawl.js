import { PuppeteerCrawler } from "@crawlee/puppeteer"
import { EnqueueStrategy, log, LoggerText,Sitemap } from "crawlee"
import dotenv from "dotenv"

import { createCrawl, push, urlExists } from "./database.js"
import { Logger } from "./log.js"
import getMeta from "./meta.js"
import nanoid from "./nanoid.js"

dotenv.config()

var crawlLog

//DEBUG, INFO, WARNING, ERROR, OFF
log.setOptions({
  logger: new LoggerText({ skipTime: false })
})

const validateInputs = (crawlName, links) => {
  if (!Array.isArray(links) || links.length === 0) {
    throw new Error("Invalid input: 'links' should be a non-empty array.")
  }
  if (typeof crawlName !== "string" || crawlName.trim() === "") {
    throw new Error("Invalid input: 'crawlName' should be a non-empty string.")
  }
}

/*old arguments: 
 crawlId,
  crawlName,
  getImages = false,
  links,
  maxRequests,
  requestHandlerTimeoutSecs = 30,
  maxRequestRetries = 2,
  crawlSitemap = false,
  reIndexDuplicates = false,
  crawlerMaxConcurrency = 5,
  */

const startCrawl = async ({
  crawlId,
  crawlName,
  crawlSitemap = false,
  fields,
  links,
  logLevel,
  maxDepth,
  maxRequestRetries,
  maxRequests,
  maxTime,
  requestHandlerTimeoutSecs
}) => {
  /*: {
      title=true,
      description=true,
      images=true,
      publisher=true,
      date=true,
      url=true,
      logo=true
  }*/
  crawlLog.debug(
    `crawler function arguments: ${JSON.stringify(
      {
        crawlId,
        crawlName,
        crawlSitemap,
        fields,
        links,
        logLevel,
        maxDepth,
        maxRequestRetries,
        maxRequests,
        maxTime,
        requestHandlerTimeoutSecs
      },
      null,
      2
    )}`

  )
  var totalURLs = 0
  var start = new Date()
  console.log(fields)
  crawlLog.info(
    `starting crawl for ${crawlName} with id ${crawlId} at ${start.toLocaleString()}`,
    crawlId
  )
  crawlLog.info(`${crawlId} started with ${links.length} links`, crawlId)

  await createCrawl(crawlId, crawlName)

  if (crawlSitemap === true) {
    try {
      let host = new URL(links[0]).origin
      let sitemapURL = `${host}/sitemap.xml`
      const { urls } = await Sitemap.load(sitemapURL)
      links = [...new Set([...links, ...urls])]
      crawlLog.info(`Sitemap loaded with ${urls.length} URLs`, crawlId)
    } catch (error) {
      crawlLog.error(
        `Error loading sitemap: ${error.message}`,
        crawlId,
        "error"
      )
    }
  }

  const options = {
    failedRequestHandler: ({ request }) => {
      crawlLog.warn(`Request ${request.url()} failed twice.`)
    },
    maxRequestRetries: maxRequestRetries,

    requestHandler: async ({ enqueueLinks, page, request }) => {
      try {
        crawlLog.info(`Crawling URL: ${request.url}`, crawlId)

        const data = await page.evaluate(
          () => document.querySelector("*").outerHTML
        )

        if (fields.images === true) {
          const images = await page.evaluate(() => {
            const images = [...document.images]
            return images.map((img) => img.src)
          })
          crawlLog.info(
            `Found ${images.length} images on ${request.url}`,
            crawlId
          )
        }
        const meta = await getMeta(request.url, data, fields)
        const pageTitle = await page.title()
        const pageContent = await page.content()

        const document_ = {
          content: pageContent,
          crawlId,
          crawlName,
          crawlTime: new Date().toISOString(),
          href: request.url,
          html: data,
          meta,
          title: pageTitle,
          type: "html"
        }

        await push(document_)
        crawlLog.info(`Successfully indexed: ${request.url}`, crawlId)
        totalURLs++
        await enqueueLinks({
          strategy: EnqueueStrategy.SameDomain
        })
      } catch (error) {
        crawlLog.error(
          `Error processing ${request.url}: ${error.message}`,
          crawlId,
          "error"
        )
      }
    },

    requestHandlerTimeoutSecs: requestHandlerTimeoutSecs
  }
  if (maxRequests && maxRequests > 0) {
    options.maxRequestsPerCrawl = maxRequests
  }
  const crawler = new PuppeteerCrawler(options)
  await crawler.run(links)
  var end = Date.now() - start
  crawlLog.info(
    `Crawl ${crawlId} finished in ${end}ms. Indexed ${totalURLs} pages.`,
    crawlId
  )
  crawlLog.info(`Crawl ${crawlId} finished`, crawlId)
  return crawlId
}

const enqueueCrawl = async (options) => {
  // validateInputs(opts.crawlName, opts.links)
  options.crawlId = nanoid()
  crawlLog = new Logger(options.crawlId)
  console.log("crawlLog", crawlLog)
  crawlLog.info(
    `Enqueuing crawl for ${options.crawlName} with id ${options.crawlId}`,
    options.crawlId
  )
  options.crawlLog = crawlLog
  startCrawl(options)
  return options.crawlId
}

export default enqueueCrawl
