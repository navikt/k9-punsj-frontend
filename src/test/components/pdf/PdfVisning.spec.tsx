import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import PdfVisning from '../../../app/components/pdf/PdfVisning';
import { renderWithIntl } from '../../testUtils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');
jest.mock('app/hooks/useQuery', () => () => ({ get: () => '1' }));

describe('<PdfVisning>', () => {
    it('Henter journalpost og viser dokument', () => {
        const journalpostid = '200';
        const dokumentid = { dokumentId: '123' };
        const journalpostDokumenter = [{ journalpostid, dokumenter: [dokumentid] }];
        renderWithIntl(<PdfVisning journalpostDokumenter={journalpostDokumenter} />);

        expect(screen.getByTitle('pdf')).toBeDefined();
    });

    it('riktig pdf-url på dokument', () => {
        window.history.pushState({}, 'Test Title', '/test');
        const journalpostid = '200';
        const dokumentid = { dokumentId: '123' };
        const journalpostDokumenter = [{ journalpostid, dokumenter: [dokumentid] }];
        renderWithIntl(<PdfVisning journalpostDokumenter={journalpostDokumenter} />);

        expect(screen.getByTitle('pdf')).toHaveAttribute('src', '/k9-punsj/api/journalpost/200/dokument/123');
    });

    it('iframe viser dokument 2 hvis ?dok=2 er i url', () => {
        window.history.pushState({}, 'Test Title', '/test?dok=2');
        const journalpostid = '200';
        const dokumenter = [{ dokumentId: '123' }, { dokumentId: '456' }];

        const journalpostDokumenter = [{ journalpostid, dokumenter }];
        renderWithIntl(<PdfVisning journalpostDokumenter={journalpostDokumenter} />);

        expect(screen.getByTitle('pdf')).toHaveAttribute('src', '/k9-punsj/api/journalpost/200/dokument/456');
    });

    it('Skal vise toggle knapper likt antall dokumenter i journalpost', async () => {
        window.history.pushState({}, 'Test Title', '/test?dok=1');

        const journalpostid = '200';
        const dokumenter = [{ dokumentId: '123' }, { dokumentId: '456' }];
        const journalpostDokumenter = [{ journalpostid, dokumenter }];
        renderWithIntl(<PdfVisning journalpostDokumenter={journalpostDokumenter} />);

        expect(screen.getByText('Dokument 1 / 2')).toBeDefined();
        expect(screen.getByText('Dokument 2 / 2')).toBeDefined();

        expect(screen.getByTitle('pdf')).toHaveAttribute('src', '/k9-punsj/api/journalpost/200/dokument/123');

        screen.getByTestId('dok-2').click();

        await waitFor(() => {
            expect(screen.getByTitle('pdf')).toHaveAttribute('src', '/k9-punsj/api/journalpost/200/dokument/456');
        });

        screen.getByTestId('dok-1').click();
        await waitFor(() => {
            expect(screen.getByTitle('pdf')).toHaveAttribute('src', '/k9-punsj/api/journalpost/200/dokument/123');
        });
    });
});
