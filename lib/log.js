import { EventEmitter } from 'events';
import winston from 'winston';
import { nanoid } from 'nanoid';

// Create an event emitter for real-time updates
const logEmitters = new Map();

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'logs.txt', level: 'info' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Log and emit event with nanoid
const writeLog = (message, crawlId="", level = 'info') => {
  const logMessage = `${crawlId} - ${message}`;
  logger.log(level, logMessage);
  
  const emitter = logEmitters.get(crawlId);
  if (emitter) {
    emitter.emit('log', { level, message: logMessage, timestamp: new Date().toISOString() });
  }
};

const createLogEmitter = (crawlId) => {
  const emitter = new EventEmitter();
  logEmitters.set(crawlId, emitter);
  return emitter;
};

const removeLogEmitter = (crawlId) => {
  logEmitters.delete(crawlId);
};

export { writeLog, createLogEmitter, removeLogEmitter };