const http = require('http');
const https = require('https');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const proxyTarget = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
const PROXIED_PREFIXES = [
  '/api/',
  '/areas',
  '/professions',
  '/professionals',
  '/services',
];

function shouldProxy(url) {
  return typeof url === 'string' && PROXIED_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function createProxyMiddleware(middleware) {
  const target = new URL(proxyTarget);
  const requestModule = target.protocol === 'https:' ? https : http;
  const basePath = target.pathname === '/' ? '' : target.pathname.replace(/\/$/, '');

  return (req, res, next) => {
    if (!shouldProxy(req.url)) {
      return middleware(req, res, next);
    }

    const headers = { ...req.headers, host: target.host };
    delete headers.origin;
    delete headers.referer;

    const proxyRequest = requestModule.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        method: req.method,
        path: `${basePath}${req.url}`,
        headers,
      },
      (proxyResponse) => {
        res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
        proxyResponse.pipe(res);
      },
    );

    proxyRequest.on('error', (error) => {
      if (res.headersSent) {
        res.end();
        return;
      }

      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `API proxy error: ${error.message}` }));
    });

    req.pipe(proxyRequest);
  };
}

const defaultEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const enhancedMiddleware = defaultEnhanceMiddleware
    ? defaultEnhanceMiddleware(middleware, server)
    : middleware;

  return createProxyMiddleware(enhancedMiddleware);
};

module.exports = config;
