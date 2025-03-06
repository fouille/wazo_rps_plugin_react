const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/v2',
    createProxyMiddleware({
      target: 'https://eu-api.ymcs.yealink.com/',
      changeOrigin: true,
    })
  );
};