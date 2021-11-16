/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import { rest } from 'msw';

export const handlers = [
    rest.get('/api/test', (req, res, ctx) => res(ctx.status(200), ctx.json({ name: 'Bobby Binders' }))),
];
