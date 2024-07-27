import { PuppeteerCrawler, Dataset } from "@crawlee/puppeteer";
import { push } from "./db.js";
import { writeLog } from "./log.js";
import getMeta from "./meta.js";
import dotenv from "dotenv";
import { nanoid } from 'nanoid';
dotenv.config();

const enqueueCrawl = async (links, crawlName) => {

  if (!Array.isArray(links) || links.length === 0) {
    throw new Error("Invalid input: 'links' should be a non-empty array.");
  }
  if (typeof crawlName !== 'string' || crawlName.trim() === '') {
    throw new Error("Invalid input: 'crawlName' should be a non-empty string.");
  }
const crawlId = nanoid();
  writeLog("Starting crawl for links: ", links, crawlId);

  const crawler = new PuppeteerCrawler({
    requestHandler: async ({ request, enqueueLinks, page }) => {
      try {
        writeLog(`Crawling URL: ${request.url}`, crawlId);

        const data = await page.evaluate(() => document.querySelector("*").outerHTML);
        const meta = await getMeta(request.url, data);
        const pageTitle = await page.title();
        const pageContent = await page.content();

        const doc = {
          crawlName: crawlName,
          href: request.url,
          title: pageTitle,
          content: pageContent,
          meta: meta,
          html: data
        };

        await push(doc);
        writeLog(`Successfully indexed: ${request.url}`, crawlId);
        await enqueueLinks(); // Enqueue all links found on the page
      } catch (error) {
        writeLog(`Error processing ${request.url}: ${error.message}`, crawlId, 'error');
      }
    },
    failedRequestHandler: ({ request }) => {
      writeLog(`Request ${request.url()} failed twice.`);
    },
    maxConcurrency: process.env.CRAWLER_MAX_CONCURRENCY || 5,
    requestTimeoutSecs: process.env.CRAWLER_REQUEST_TIMEOUT || 30,
  });

  try {
    await crawler.run(links);
    writeLog("Crawl completed successfully.", crawlId);
  } catch (error) {
    writeErrorLog(`Crawler encountered an error: ${error.message}`, crawlId, error);
  }
  return crawlId;
};

export default enqueueCrawl;