// middleware/debug.js
const debugMiddleware = (req, res, next) => {
  console.log('\n=== DEBUG REQUEST ===');
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  console.log('=== END DEBUG ===\n');
  next();
};

module.exports = debugMiddleware;