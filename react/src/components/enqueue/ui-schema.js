const uiSchema = {
  links: {
    "ui:widget": "textarea",
    "ui:placeholder": "Enter links"
  },
  crawlName: {
    "ui:widget": "text",
    "ui:placeholder": "Name of this indexed crawl"
  },
  maxDepth: {
    "ui:widget": "updown",
    "ui:placeholder": "Max depth"
  },
  maxRequests: {
    "ui:widget": "updown",
    "ui:placeholder": "Max requests"
  },
  maxRequestRetries: {
    "ui:widget": "updown",
    "ui:placeholder": "Max request retries"
  },
  maxTime: {
    "ui:widget": "updown",
    "ui:placeholder": "Max time"
  },
  reIndexDuplicates: {
    "ui:widget": "checkbox"
  },
  crawlSitemap: {
    "ui:widget": "checkbox"
  },
  logLevel: {
    "ui:widget": "select",
    "ui:options": {
      enumOptions: [
        {
          value: "DEBUG",
          label: "Debug"
        },
        {
          value: "INFO",
          label: "Info"
        },
        {
          value: "WARN",
          label: "Warn"
        },
        {
          value: "ERROR",
          label: "Error"
        }
      ]
    }
  }
}
export default uiSchema;