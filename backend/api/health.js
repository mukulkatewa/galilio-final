// Health check endpoint
module.exports = (req, res) => {
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasJWT = !!process.env.JWT_SECRET;
  const isConfigured = hasDatabase && hasJWT;
  
  const status = isConfigured ? 200 : 503;
  
  res.status(status).json({
    success: isConfigured,
    message: isConfigured ? 'Galilio API is running' : 'Configuration Error: Missing environment variables',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    configured: isConfigured,
    missingVars: isConfigured ? undefined : [
      !hasDatabase && 'DATABASE_URL',
      !hasJWT && 'JWT_SECRET'
    ].filter(Boolean)
  });
};
