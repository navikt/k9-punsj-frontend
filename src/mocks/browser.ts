import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// @typescript-eslint/ban-ts-comment
// @ts-ignore
window.msw = {
    worker,
    http,
    HttpResponse,
};
