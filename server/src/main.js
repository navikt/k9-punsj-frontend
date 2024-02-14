/* eslint-disable no-underscore-dangle */
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';
import { validateAzureToken } from '@navikt/next-auth-wonderwall';

import * as headers from './headers.js';
import logger from './log.js';
import { getIssuer } from './azure/issuer.js';

// for debugging during development
import config from './config.js';
import msgraph from './azure/msgraph.js';
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

        await getIssuer();

        // Liveness and readiness probes for Kubernetes / nais
        server.get(['/health/isAlive', '/health/isReady'], (req, res) => {
            res.status(200).send('Alive');
        });

        server.get(['/oauth2/login'], async (req, res) => {
            res.status(502).send({
                message: 'Wonderwall must handle /oauth2/login',
            });
        });

        const ensureAuthenticated = async (req, res, next) => {
            const { authorization } = req.headers;
            const loginPath = `/oauth2/login?redirect=${req.originalUrl}`;
            if (!authorization) {
                logger.debug('User token missing. Redirect til login.');
                res.redirect(loginPath);
            } else {
                // Validate token and continue to app
                // eslint-disable-next-line no-lonely-if
                if ((await validateAzureToken(authorization)) === 'valid') {
                    logger.debug('User token is valid. Continue.');
                    next();
                } else {
                    logger.debug('User token is NOT valid. Redirect til login.');
                    res.redirect(loginPath);
                }
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
            msgraph
                .getUserInfoFromGraphApi(req.headers.authorization.replace('Bearer ', ''))
                .then((userinfo) => res.json(userinfo))
                .catch((err) => res.status(500).json(err));
        });

        // return groups that the user is a member of from the Microsoft Graph API
        server.get('/me/memberOf', (req, res) => {
            msgraph
                .getUserGroups(req.headers.authorization)
                .then((userinfo) => res.json(userinfo))
                .catch((err) => res.status(500).json(err));
        });

        server.get('/envVariables', (req, res) => {
            res.json(envVariables());
        });
        reverseProxy.setup(server);

        // serve static files
        const rootDir = './dist';
        server.use('/dist', express.static('./dist'));
        server.use(/^\/(?!.*dist).*$/, (req, res) => {
            res.sendFile('index.html', { root: rootDir });
        });

        server.listen(port, () => logger.info(`Listening on port ${port}`));
    } catch (error) {
        logger.error('Error during start-up: ', error);
    }
}

startApp().catch((err) => logger.error(err));
