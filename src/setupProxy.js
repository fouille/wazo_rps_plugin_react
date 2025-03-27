const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/v2',
    createProxyMiddleware({
      target: 'https://eu-api.ymcs.yealink.com/',
      changeOrigin: true,
    })
  );
  app.use(
    '/fanvil',
    createProxyMiddleware({
      target: 'https://fdps.fanvil.com/xmlrpc.php',
      changeOrigin: true,
    })
  );
};