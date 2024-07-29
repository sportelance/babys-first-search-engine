export function errorHandler(err, req, res, next) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
  export function notFoundHandler(req, res, next) {
    res.status(404).json({ error: 'Not Found' });
  }