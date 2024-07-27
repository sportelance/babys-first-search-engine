import metascraper from "metascraper";
import metascraperUrl from "metascraper-url";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperPublisher from "metascraper-publisher";

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
