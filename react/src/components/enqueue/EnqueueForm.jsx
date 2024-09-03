import Form from "@rjsf/core"
import schema from "./schema"
import validator from "@rjsf/validator-ajv8"
import uiSchema from "./ui-schema"

const log = (type) => console.log.bind(console, type)

const EnqueueForm = ({ onSubmit = function () {} }) => {
  const handleSubmit = ({ formData }) => {
    formData.links = formData.links.split("\n").map((link) => link.trim())
    onSubmit(formData)
  }
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      onChange={log("changed")}
      onSubmit={handleSubmit}
      onError={log("errors")}
    />
  )
}

export default EnqueueForm
