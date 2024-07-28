import metascraper from "metascraper";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";

const getMeta = async ( url, html) => {


  const metadata = await metascraper([
    metascraperDate(),
    metascraperDescription(),
    metascraperImage(),
    metascraperPublisher(),
    metascraperTitle(),
    metascraperUrl(),
  ])({ html, url });
  return metadata;
}

export default getMeta;
