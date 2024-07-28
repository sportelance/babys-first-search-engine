import { body, query } from 'express-validator';

export const validateSubmit = [
  body('content').isString().notEmpty(),
  body('href').isURL(),
  body('index').isString().notEmpty(),
  body('title').isString().notEmpty(),
];

export const validateEnqueue = [
  body('links').isArray().notEmpty(),
  body('crawlName').isString().notEmpty(),
];

export const validateSearch = [
  query('q').optional().isString(),
  body('q').optional().isString(),
];