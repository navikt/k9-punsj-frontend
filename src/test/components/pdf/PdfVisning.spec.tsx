import { render, screen } from '@testing-library/react';
import React from 'react';
import PdfVisning from '../../../app/components/pdf/PdfVisning';
import { renderWithRouterAndIntl } from '../../testUtils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');
jest.mock('app/hooks/useQuery', () => () => ({ get: () => '1' }));

describe('<PdfVisning>', () => {
    it('Henter journalpost og viser dokument', () => {
        const journalpostid = '200';
        const dokumentid = { dokumentId: '123' };
        const journalpostDokumenter = [{ journalpostid, dokumenter: [dokumentid] }];
        renderWithRouterAndIntl(<PdfVisning journalpostDokumenter={journalpostDokumenter} />);

        expect(screen.getByTitle('pdf')).toBeDefined();
    });
});
