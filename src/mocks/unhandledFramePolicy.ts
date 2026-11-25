import type { UnhandledFrameHandle } from 'msw';
import { HttpNetworkFrame } from 'msw/experimental';

const mockPdfPath = /^\/api\/k9-punsj\/journalpost\/[^/]+\/dokument\/[^/]+\/?$/;

export const createUnhandledFramePolicy = (mswMode: string | undefined): UnhandledFrameHandle => {
    if (mswMode !== 'test') return 'bypass';

    return ({ frame, defaults }) => {
        if (frame instanceof HttpNetworkFrame) {
            const { request } = frame.data;
            const pathname = new URL(request.url).pathname;
            const isMockPdfRequest =
                mockPdfPath.test(pathname) && (request.method === 'GET' || request.method === 'HEAD');

            if (pathname.startsWith('/api/') && !isMockPdfRequest) {
                defaults.error();
                frame.errorWith(Response.error());
                return;
            }
        }

        frame.passthrough();
    };
};
