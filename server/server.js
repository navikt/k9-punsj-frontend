import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { validateToken } from '@navikt/oasis';
import { decodeJwt } from 'jose';

import * as headers from './src/headers.js';
import logger from './src/log.js';
import config from './src/config.js';
import reverseProxy from './src/reverse-proxy.js';
import { envVariables } from './envVariables.js';

const server = express();
const { port } = config.server;

/**
 * Custom async timeout middleware using AbortController.
 * Ends the request with 503 if it exceeds the specified duration.
 */
function requestTimeout(ms) {
    return (req, res, next) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
            res.status(503).send('Request Timeout');
        }, ms);

        req.signal = controller.signal;

        res.on('finish', () => clearTimeout(timeout));
        res.on('close', () => clearTimeout(timeout));

        next();
    };
}

async function startApp() {
    try {
        // Request timeout middleware (10 minutes)
        server.use(requestTimeout(10 * 60 * 1000));

        // Setup custom headers
        headers.setup(server);

        // Logging
        server.use(logger.morganMiddleware);

        // Trust reverse proxy
        server.set('trust proxy', 1);

        // Security headers
        server.use(
            helmet({
                contentSecurityPolicy: {
                    useDefaults: false,
                    directives: {
                        'default-src': ["'self'"],
                        'base-uri': ["'self'"],
                        'connect-src': ["'self'", 'https://sentry.gc.nav.no', process.env.NAIS_FRONTEND_URL || ''],
                        'font-src': ["'self'", 'https://fonts.gstatic.com'],
                        'img-src': ["'self'", 'data:'],
                        'style-src': ["'self'", "'unsafe-inline'"],
                        'frame-src': ["'self'"],
                        'child-src': ["'self'"],
                        'media-src': ["'none'"],
                        'object-src': ["'none'"],
                    },
                },
                referrerPolicy: { policy: 'origin' },
                hidePoweredBy: true,
                noSniff: true,
            }),
        );

        // CORS configuration
        server.use(
            cors({
                origin: config.server.host,
                methods: config.cors.allowedMethods,
                exposedHeaders: config.cors.exposedHeaders,
                allowedHeaders: config.cors.allowedHeaders,
            }),
        );

        // Kubernetes liveness and readiness probes
        server.get('/health/isAlive', (req, res) => {
            res.status(200).send('Alive');
        });

        server.get('/health/isReady', (req, res) => {
            res.status(200).send('Ready');
        });

        // Block direct access to login route
        server.get('/oauth2/login', async (req, res) => {
            res.status(502).send({
                message: 'Wonderwall must handle /oauth2/login',
            });
        });

        // Authentication middleware
        const ensureAuthenticated = async (req, res, next) => {
            try {
                const token = req.headers.authorization;

                if (!token) {
                    logger.debug('User token missing.');
                    return res.status(401).send();
                }

                const validation = await validateToken(token);

                if (!validation.ok) {
                    logger.debug('User token not valid.');
                    return res.status(401).send();
                }

                logger.debug('User token is valid.');
                next();
            } catch (error) {
                logger.error('Error validating token:', error);
                res.status(401).send();
            }
        };

        // Apply auth middleware to protected routes
        server.use(ensureAuthenticated);

        server.get('/logout', async (req, res) => {
            if (req.headers.authorization) {
                res.redirect('/oauth2/logout');
            } else {
                res.status(204).send();
            }
        });

        server.get('/me', (req, res) => {
            const token = req.headers.authorization;
            const user = decodeJwt(token);
            res.send({
                name: user.name,
            });
        });

        server.get('/envVariables', (req, res) => {
            res.json(envVariables());
        });

        // Setup reverse proxy
        reverseProxy.setup(server);

        // Serve static files
        const rootDir = './dist';
        server.use('/dist', express.static(rootDir));

        // Fallback to SPA for unmatched routes (excluding API and dist)
        server.use((req, res, next) => {
            const isStatic =
                req.path.startsWith('/dist') || req.path.startsWith('/api') || req.path.startsWith('/health');
            if (isStatic) return next();

            res.sendFile('index.html', { root: './dist' });
        });

        // Global error handler
        server.use((err, req, res) => {
            logger.error('Unhandled error:', err);
            res.status(500).send('Internal Server Error');
        });

        // Start server
        await new Promise((resolve) => server.listen(port, resolve));
        logger.info(`Listening on port ${port}`);
    } catch (error) {
        logger.error('Error during start-up:', error);
        // eslint-disable-next-line no-console
        console.log('Error in startApp:', error);
    }
}

startApp().catch((err) => logger.error('Fatal error:', err));
