# Baby's First Search Engine
> how hard could building it actually be?

![](./.github/logo-search.jpg)

**July '24**

I think that it's becoming harder and harder to find real information and primary sources, especially niche ones, online.

It would be nice to index and archive all of the niche, cool, interesting information before it's digested and shat out by chatgpt into bizarre, incomprehensible garbage.

Things I find interesting that I want to save for my own gawking:

 - weird marketing sites that will fade away
 - forum posts about creating patinas on metal 
 - shitty things politicians say on social media
 - funny jokes in a facebook group

### Intention
Each crawl should be named so that I can comment on it and remember why I indexed it, and why I find it interesting.

### Information gleaned
Currently, Crawlee will run using Puppeteer and recursively scrape any links it finds, attempt to parse and save html (would include rendered js elements), as well as save the raw source. This seems like it would take up a lot of space. What should I actually do?

### Thoughts/roadmap

- I don't really like express. I'd prefer Hono, but it doesn't seem to "just work." 
- I'm toying with using React for the front-end, but I also really like the idea of a super-simple, no-frills html setup.
- Right now logging sucks, winston is setup in kind of a haphazard way, and crawl status is gleaned by streaming from the live log file. This is not ideal, and should use a db, but I do think monitoring crawling is important.
- crawl options config upon submission (depth, max pages, etc)
- crawl status made more obvious (running, stopped, etc)
- Spawn a new process for each crawl and figure out how to pipe crawlee output to the main log
- figure out how to stop/pause/resume a crawl
- tab on html page that lists all crawls
- tab on html page that lists all indexed pages, paginated
- Read up on Elasticsearch and figure out how to use it for search in a smarter way
- Set up deploy framework for my VM, maybe github actions and pm2.
- run crawls and server using pm2
- run server and crawls using node clusters, potentially involving pm2
- maybe dockerize the whole thing, depending on how i feel about it
- continue to make a cute, minimal css framework for index.html
- expose api for search
- create simple auth, or run page behind my cloudflare/okta auth

## Features (that probably don't work)

- **Web Crawling**: Uses `crawlee` and `puppeteer` to crawl and index web pages using headless browser
- **Search Functionality**: Allows users to search through indexed pages.
- **Express Server**: Serves the search engine through an Express server.
- **Validation**: Uses `express-validator` for input validation.
- **Logging**: Utilizes `winston` for logging.
- **Elasticsearch**: Integrates with Elasticsearch for efficient searching. Elasticsearch should be run using docker-compose file.
- **Pretty Code**: Configured with ESLint and Prettier for code quality and consistency.
