/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import { rest } from 'msw';
import { testHandlers } from './testHandlers';

let handlers = [
    rest.get('/api/test', (req, res, ctx) => res(ctx.status(200), ctx.json({ name: 'Bobby Binders' }))),
    rest.get(
        'http://localhost:8101/api/k9-formidling/brev/maler?sakstype=OMP&avsenderApplikasjon=K9PUNSJ',
        (req, res, ctx) =>
            res(
                ctx.status(200),
                ctx.json({
                    INNHEN: { navn: 'Innhent dokumentasjon', mottakere: [] },
                    GENERELT_FRITEKSTBREV: { navn: 'Fritekst generelt brev', mottakere: [] },
                })
            )
    ),
];

if (process.env.MSW_MODE === 'test') {
    handlers = handlers.concat(Object.values(testHandlers));
}

export { handlers };
