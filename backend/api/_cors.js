// CORS helper for serverless functions
const allowedOrigins = [
  'http://localhost:3000',
  'https://galilio-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  return true;
}

function handleCors(handler) {
  return async (req, res) => {
    setCorsHeaders(req, res);
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    return handler(req, res);
  };
}

module.exports = { setCorsHeaders, handleCors };
