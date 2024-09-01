const schema = {
  title: "",
  type: "object",
  required: ["links", "crawlName"],
  properties: {
    links: {
      type: "string",
      title: "links",
      description: "List of links to seed crawl with"
      
    },
    crawlName: {
      type: "string",
      title: "Name of this indexed crawl",
      description: "",
      minLength: 1
    },
    maxDepth: {
      type: "integer",
      title: "Max depth",

      default: -1
    },
    maxRequests: {
      type: "integer",
      title: "Max requests",
      default: -1
    },
    maxTime: {
      type: "integer",
      title: "Max time",
      description: "",
      default: -1
    },
    maxRequestRetries: {
      type: "integer",
      title: "Max request retries",
      default: 2,
      minimum: 0
    },
    requestHandlerTimeoutSecs: {
      type: "integer",
      title: "Request handler timeout (secs)",
      default: 30,
      minimum: 1
    },
    reIndexDuplicates: {
      type: "boolean",
      title: "Re-index duplicates?"
    },
    crawlSitemap: {
      type: "boolean",
      title: "Crawl sitemap.xml?",
      description: ""
    },
    logLevel: {
      type: "string",
      title: "log level",
      default: "INFO",

      enum: ["DEBUG", "INFO", "WARN", "ERROR"]
    },
    fields: {
      type: "object",
      title: "Fields to index",
      properties: {
        title: {
          type: "boolean",
          title: "Title",
          description: "",
          default: true
        },
        description: {
          type: "boolean",
          title: "Description",
          description: "",
          default: true
        },
        images: {
          type: "boolean",
          title: "Images",
          description: "",
          default: true
        },
        publisher: {
          type: "boolean",
          title: "Publisher",
          description: "",
          default: true
        },
        date: {
          type: "boolean",
          title: "publish Date",
          description: "",
          default: true
        },
        url: {
          type: "boolean",
          title: "URL",
          description: "",
          default: true
        },
        logo: {
          type: "boolean",
          title: "Logo",
          description: "",
          default: true
        }
      }
    }
  }
}

export default schema;