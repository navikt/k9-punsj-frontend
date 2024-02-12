import { getIssuer } from './issuer';
import config from '../config';

let client;

export const getAuthClient = async () => {
  if (client) return client;

  const azureConfig = config.azureAd;

  const metadata = {
    client_id: azureConfig.clientId,
    token_endpoint_auth_method: azureConfig.tokenEndpointAuthMethod,
    token_endpoint_auth_signing_alg: azureConfig.tokenEndpointAuthSigningAlg,
  };

  const issuer = await getIssuer();
  const jwks = azureConfig.clientJwks;
  client = new issuer.Client(metadata, jwks);

  return client;
};

export default {
  getAuthClient,
};
