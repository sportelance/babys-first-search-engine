import metascraper from "metascraper";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import metascraperLogo from "metascraper-logo";

const getMeta = async ( url, html) => {
return await metascraper([
    metascraperDate(),
    metascraperDescription(),
    metascraperImage(),
    metascraperPublisher(),
    metascraperTitle(),
    metascraperUrl(),
    metascraperLogo()
  ])({ html, url });
}

export default getMeta;
