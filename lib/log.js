import createFolderIfItDoesNotExist from "elliotisms/createFolderIfItDoesNotExist"
import fs from "fs"
import nanoid from "./nanoid.js"
import { EventEmitter } from "node:events"
import readline from "node:readline"
import winston from "winston"
// Create an event emitter for real-time updates
const logEmitters = new Map()

// Configure winston logger
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ level, message, timestamp }) =>
        `${timestamp} - ${level.toUpperCase()}: ${message}`
    )
  ),
  level: "info",
  transports: [
    new winston.transports.File({ filename: "./logs/logs.txt", level: "info" }),
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error"
    })
  ]
})

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  )
}
// Read previous logs from the file
const readPreviousLogs = async (crawlId) => {
  const logFile = "./logs/logs.txt"
  const logs = []

  try {
    const fileStream = fs.createReadStream(logFile)
    const rl = readline.createInterface({
      crlfDelay: Infinity,
      input: fileStream
    })

    for await (const line of rl) {
      if (line.includes(crawlId)) {
        logs.push(line)
      }
    }
  } catch (error) {
    console.error("Error reading logs:", error)
  }

  return logs
}

class Logger {
  constructor(crawlId) {
    this.crawlId = crawlId
  }
  log(message) {
    this.info(message)
  }
  defaultLog(level, message) {
    let logMessage = this.makeMessage(message)
    logger.log(level, logMessage)
    this.emitLog(logMessage, level)
  }

  debug(message) {
    this.defaultLog("debug", message)
  }

  error(message) {
    this.defaultLog("error", message)
  }

  info(message) {
    this.defaultLog("info", message)
  }

  warn(message) {
    this.defaultLog("warn", message)
  }

  emitLog(message, level) {
    const emitter = logEmitters.get(this.crawlId)
    if (emitter) {
      emitter.emit("log", {
        level,
        message,
        timestamp: new Date().toISOString()
      })
    }
  }

  makeMessage(message) {
    return `${this.crawlId ? `${this.crawlId} - ` : ""}${message}`
  }
}

const createLogEmitter = (crawlId) => {
  const emitter = new EventEmitter()
  logEmitters.set(crawlId, emitter)
  // Send previous logs
  // const previousLogs = await readPreviousLogs(crawlId);
  // for (const log of previousLogs) {
  //    const [timestamp, level, ...messageParts] = log.split(' - ');
  //    const message = messageParts.join(' - ');
  //    emitter.emit('log', { level: level.toLowerCase(), message, timestamp });
  //  }
  return emitter
}

const removeLogEmitter = (crawlId) => {
  logEmitters.delete(crawlId)
}

const logFolder = "./logs"
const init = async () => {
  await createFolderIfItDoesNotExist(logFolder)
}
init()

let defaultLogger = new Logger()
const log = defaultLogger.log.bind(defaultLogger)
log.info = defaultLogger.info.bind(defaultLogger)
log.warn = defaultLogger.warn.bind(defaultLogger)
log.error = defaultLogger.error.bind(defaultLogger)
log.debug = defaultLogger.debug.bind(defaultLogger)

export { createLogEmitter, log, removeLogEmitter, Logger }
