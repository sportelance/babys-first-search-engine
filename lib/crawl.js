import { PuppeteerCrawler } from "@crawlee/puppeteer";
import { EnqueueStrategy } from "crawlee";
import dotenv from "dotenv";

import { createCrawl, push, urlExists } from "./database.js";
import { writeLog } from "./log.js";
import getMeta from "./meta.js";
import nanoid from "./nanoid.js";

dotenv.config();

const { CRAWLER_MAX_CONCURRENCY = 5 } = process.env;

const validateInputs = (crawlName, links) => {
  if (!Array.isArray(links) || links.length === 0) {
    throw new Error("Invalid input: 'links' should be a non-empty array.");
  }
  if (typeof crawlName !== "string" || crawlName.trim() === "") {
    throw new Error("Invalid input: 'crawlName' should be a non-empty string.");
  }
};


const startCrawl = async ({ crawlId, crawlName, links, maxRequests, reIndexDuplicates }) => {
  var start = new Date()

  writeLog(`starting crawl for ${crawlName} with id ${crawlId} at ${now.toLocaleString()}`, crawlId);
  writeLog(`${crawlId} started with ${links.length} links`, crawlId);

  await createCrawl(crawlId, crawlName);
  

  const options = {
    failedRequestHandler: ({ request }) => {
      writeLog(`Request ${request.url()} failed twice.`);
    },
    maxConcurrency: Number(CRAWLER_MAX_CONCURRENCY),
    requestHandler: async ({ enqueueLinks, page, request }) => {
      try {
        writeLog(`Crawling URL: ${request.url}`, crawlId);

        const data = await page.evaluate(() => document.querySelector("*").outerHTML);
        const meta = await getMeta(request.url, data);
        const pageTitle = await page.title();
        const pageContent = await page.content();

        const document_ = {
          content: pageContent,
          crawlId,
          crawlName,
          crawlTime: new Date().toISOString(),
          href: request.url,
          html: data,
          meta,
          title: pageTitle,
        };

        await push(document_);
        writeLog(`Successfully indexed: ${request.url}`, crawlId);

        await enqueueLinks({
          strategy: EnqueueStrategy.SameDomain,
        });
      } catch (error) {
        writeLog(`Error processing ${request.url}: ${error.message}`, crawlId, "error");
      }
    },
    ...(maxRequests > 0 && { maxRequestsPerCrawl: maxRequests }),
  };

  const crawler = new PuppeteerCrawler(options);
  await crawler.run(links);
  var end = new Date() - start
  writeLog(`Crawl ${crawlId} finished in ${end}ms`, crawlId);
  writeLog(`Crawl ${crawlId} finished`, crawlId);
  return crawlId;
}

const enqueueCrawl = async ({ crawlName, links, maxRequests = -1, reIndexDuplicates = false }) => {
  validateInputs(crawlName, links);
  const crawlId = nanoid();
  writeLog(`Enqueuing crawl for ${crawlName} with id ${crawlId}`, crawlId);
  startCrawl({ crawlName, links, maxRequests, reIndexDuplicates, crawlId  });
  return crawlId;
};

export default enqueueCrawl;