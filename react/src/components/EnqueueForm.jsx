import Form from "@rjsf/core"

import validator from "@rjsf/validator-ajv8"

const schema = {
  title: "",
  type: "object",
  required: ["links", "crawlName", "maxRequests"],
  properties: {
    links: {
      type: "string",
      title: "links",
      description: "List of links to seed crawl with",
      minLength: 1,
      format: "uri"
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
      default: -1,
      minimum: 1
    },
    maxTime: {
      type: "integer",
      title: "Max time",
      description: "",
      default: -1
    },
    reIndexDuplicates: {
      type: "boolean",
      title: "Re-index duplicates?",

    },
    crawlSitemap: {
      type: "boolean",
      title: "Crawl sitemap.xml?",
    },
    logLevel: {
      type: "string",
      title: "log level",
      default: "INFO",
      
      enum: ["DEBUG", "INFO", "WARN", "ERROR"]
    }
  }
}
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
const log = (type) => console.log.bind(console, type)
const EnqueueForm = ({ onSubmit = function () {} }) => {
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      onChange={log("changed")}
      onSubmit={log("submitted")}
      onError={log("errors")}
    />
  )
}

export default EnqueueForm
