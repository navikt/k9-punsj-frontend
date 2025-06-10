import proxy from 'express-http-proxy';
import { requestOboToken, validateToken } from '@navikt/oasis';
import url from 'url';

import config from './config.js';
import log from './log.js';

const xTimestamp = 'x-Timestamp';
const stripTrailingSlash = (str) => (str.endsWith('/') ? str.slice(0, -1) : str);

const proxyOptions = (api) => ({
    timeout: 60000,
    proxyReqOptDecorator: async (options, req) => {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            await validateToken(token);
            const requestTime = Date.now();
            options.headers[xTimestamp] = requestTime;
            delete options.headers.cookie;

            return new Promise((resolve, reject) => {
                requestOboToken(token, api.scopes).then(
                    (obo) => {
                        if (!obo.ok) {
                            reject(obo.error);
                        }
                        options.headers.Authorization = `Bearer ${obo.token}`;
                        resolve(options);
                    },
                    (error) => {
                        log.error(error);
                        reject(error);
                    },
                );
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            log.error(error);
            throw error; // re-throw the error so it can be handled by the caller
        }
    },
    proxyReqPathResolver: (req) => {
        const urlFromApi = url.parse(api.url);
        const pathFromApi = urlFromApi.pathname === '/' ? '' : urlFromApi.pathname;
        const urlFromRequest = url.parse(req.originalUrl);
        let pathFromRequest = urlFromRequest.pathname;

        // Remove /k9-punsj from the path
        pathFromRequest = pathFromRequest.replace('/api/k9-punsj', '/api');
        pathFromRequest = pathFromRequest.replace('/api/k9-formidling', '/k9/formidling/api');
        const queryString = urlFromRequest.query;
        const newPath = (pathFromApi || '') + (pathFromRequest || '') + (queryString ? `?${queryString}` : '');

        log.info(`Proxying request from '${req.originalUrl}' to '${stripTrailingSlash(urlFromApi.href)}${newPath}'`);
        return newPath;
    },
    userResHeaderDecorator: (headers, userReq, userRes, proxyReq, proxyRes) => {
        const { statusCode } = proxyRes;
        const requestTime = Date.now() - proxyReq.getHeader(xTimestamp);
        const melding = `${statusCode} ${proxyRes.statusMessage}: ${userReq.method} - ${userReq.originalUrl} (${requestTime}ms)`;
        const callIdValue = proxyReq.getHeader('Nav-Callid');
        if (statusCode >= 500) {
            log.logger.warn(melding, { 'Nav-Callid': callIdValue });
        } else {
            log.logger.info(melding, { 'Nav-Callid': callIdValue });
        }
        return headers;
    },

    proxyErrorHandler(err, res, next) {
        switch (err && err.code) {
            case 'ENOTFOUND': {
                log.warning(`${err}, with code: ${err.code}`);
                return res.status(404).send();
            }
            case 'ECONNRESET': {
                return res.status(504).send();
            }
            case 'ECONNREFUSED': {
                return res.status(500).send();
            }
            default: {
                log.warning(`${err}, with code: ${err.code}`);
                next(err);
            }
        }
    },
});

const timedOut = function (req, res, next) {
    if (!req.timedout) {
        next();
    } else {
        log.warning(`Request for ${req.originalUrl} timed out!`);
    }
};

const setup = (router) => {
    config.reverseProxyConfig.apis.forEach((api) => {
        router.use(`${api.path}/*`, timedOut, proxy(api.url, proxyOptions(api)));
        // eslint-disable-next-line no-console
        log.info(`Proxy set up: ${api.path}/* -> ${api.url}`);
    });
};

export default { setup };
