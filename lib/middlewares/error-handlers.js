export function errorHandler(error, request, reply) {

  reply.status(500).send(`Error: ${error.message}\n${error.stack}`)
}

export function notFoundHandler(request, reply) {
  reply.status(404).send("Not Found")
}
