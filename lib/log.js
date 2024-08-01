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
  static log(message, crawlId = null) {
    this.info(message, crawlId)
  }
  static defaultLog(level, message, crawlId = null) {
    let logMessage = this.makeMessage(message, crawlId)
    logger.log(level, logMessage)
    this.emitLog(logMessage, crawlId, level)
  }

  static debug(message, crawlId = null) {
    this.defaultLog("debug", message, crawlId)
  }

  static error(message, crawlId = null) {
    this.defaultLog("error", message, crawlId)
  }

  static info(message, crawlId = null) {
    this.defaultLog("info", message, crawlId)
  }

  static warn(message, crawlId = null) {
    this.defaultLog("warn", message, crawlId)
  }

  static emitLog(message, crawlId, level) {
    const emitter = logEmitters.get(crawlId)
    if (emitter) {
      emitter.emit("log", {
        level,
        message,
        timestamp: new Date().toISOString()
      })
    }
  }

  static makeMessage(message, crawlId) {
    return `${crawlId ? `${crawlId} - ` : ""}${message}`
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

const log = Logger.log.bind(Logger)
log.info = Logger.info.bind(Logger)
log.warn = Logger.warn.bind(Logger)
log.error = Logger.error.bind(Logger)
log.debug = Logger.debug.bind(Logger)

export { createLogEmitter, log, removeLogEmitter }
