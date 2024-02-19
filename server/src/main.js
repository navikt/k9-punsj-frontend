/* eslint-disable no-underscore-dangle */
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';
import { decodeJwt, getSession } from '@navikt/oasis';

import { ApiPath } from 'app/apiConfig.js';
import * as headers from './headers.js';
import logger from './log.js';

// for debugging during development
import config from './config.js';
import reverseProxy from './reverse-proxy.js';
import { envVariables } from '../envVariables.js';

const server = express();
const { port } = config.server;

// Enable rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

const globalErrorHandler = (err, req, res) => {
    logger.warning(err.stack);
    res.status(err.status || 500).send({ error: err });
};

async function startApp() {
    try {
        // log request
        server.use(timeout('10m'));
        headers.setup(server);

        server.use(limiter);

        // Logging i json format
        server.use(logger.morganMiddleware);

        server.set('trust proxy', 1);

        server.use(
            helmet({
                contentSecurityPolicy: {
                    useDefaults: false,
                    directives: {
                        'default-src': ["'self'"],
                        'base-uri': ["'self'"],
                        'connect-src': ["'self'", 'https://sentry.gc.nav.no', 'https://graph.microsoft.com'],
                        'font-src': ["'self'", 'https://cdn.nav.no', 'data:'],
                        'img-src': ["'self'", 'data:', 'blob:'],
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

        // CORS konfig
        server.use(
            cors({
                origin: config.server.host,
                methods: config.cors.allowedMethods,
                exposedHeaders: config.cors.exposedHeaders,
                allowedHeaders: config.cors.allowedHeaders,
            }),
        );

        // Liveness and readiness probes for Kubernetes / nais
        server.get('/health/isAlive', (req, res) => {
            res.status(200).send('Alive');
        });
        server.get('/health/isReady', (req, res) => {
            res.status(200).send('Ready');
        });

        server.get(['/oauth2/login'], async (req, res) => {
            res.status(502).send({
                message: 'Wonderwall must handle /oauth2/login',
            });
        });

        const ensureAuthenticated = async (req, res, next) => {
            try {
                const session = await getSession(req);
                if (!session) {
                    logger.debug('User token missing. Redirecting to login.');
                    res.redirect(`${ApiPath.LOGIN}?redirect=${req.originalUrl}`);
                } else {
                    logger.debug('User token is valid. Continue.');
                    next();
                }
            } catch (error) {
                logger.error('Error getting session:', error);
                res.redirect(`${ApiPath.LOGIN}?redirect=${req.originalUrl}`);
            }
        };

        // The routes below require the user to be authenticated
        server.use(ensureAuthenticated);

        server.get(['/logout'], async (req, res) => {
            if (req.headers.authorization) {
                res.redirect('/oauth2/logout');
            }
        });

        // return user info fetched from the Microsoft Graph API
        server.get('/me', (req, res) => {
            decodeJwt(req.headers.authorization).then((decoded) => {
                console.log('decoded', decoded);
            });
        });

        server.get('/envVariables', (req, res) => {
            res.json(envVariables());
        });
        reverseProxy.setup(server);

        // serve static files
        const rootDir = './dist';
        server.use('/dist', express.static('./dist'));
        server.use(/^\/(?!.*dist)(?!api).*$/, (req, res) => {
            res.sendFile('index.html', { root: rootDir });
        });

        server.listen(port, () => logger.info(`Listening on port ${port}`));
    } catch (error) {
        logger.error('Error during start-up: ', error);
    }
}

startApp().catch((err) => logger.error(err));