/* eslint-disable import/prefer-default-export */

/* eslint-disable  */
import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.msw = {
    worker,
    http,
    HttpResponse,
};
