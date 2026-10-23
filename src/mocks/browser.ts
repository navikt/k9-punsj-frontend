import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw/http';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// @ts-ignore
window.msw = {
    worker,
    http,
    HttpResponse,
};
