import { createServer } from 'vite';
import { loadRootEnv } from './load-env.mjs';

loadRootEnv();

const server = await createServer();

await server.listen();

// eslint-disable-next-line no-console
console.log(`Started server on http://localhost:${server.config.server.port}/`);
