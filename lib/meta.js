import metascraper from "metascraper"
import metascraperDate from "metascraper-date"
import metascraperDescription from "metascraper-description"
import metascraperImage from "metascraper-image"
import metascraperLogo from "metascraper-logo"
import metascraperPublisher from "metascraper-publisher"
import metascraperTitle from "metascraper-title"
import metascraperUrl from "metascraper-url"

const functionMappings = {
  title: metascraperTitle,
  description: metascraperDescription,
  images: metascraperImage,
  publisher: metascraperPublisher,
  date: metascraperDate,

  logo: metascraperLogo
}

const getMeta = async (url, html, fields) => {
  let meta = []
  for await (const [key, value] of Object.entries(fields)) {
    if (value === true && functionMappings[key]) {
      meta.push(functionMappings[key]())
    }
  }

  return await metascraper(meta, { html, url })
}

export default getMeta
