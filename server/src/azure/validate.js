import { jwtVerify } from 'jose';
import { getIssuer } from './issuer';
import { getJwkSet } from './jwk';
import config from '../config';
import logger from '../log';

const isTokenValid = async (token) => jwtVerify(token, await getJwkSet(), {
  issuer: (await getIssuer()).metadata.issuer,
  audience: config.azureAd.clientId,
});

export const validateAuthorization = async (authorization) => {
  try {
    const token = authorization.replace('Bearer ', '');
    const JWTVerifyResult = await isTokenValid(token);
    return !!JWTVerifyResult?.payload;
  } catch (error) {
    logger.warning(`Azure AD error: ${error}`);
    return false;
  }
};

export default {
  validateAuthorization,
};
