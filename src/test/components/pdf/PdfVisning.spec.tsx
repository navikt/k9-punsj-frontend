import { shallow } from 'enzyme';
import React from 'react';
import PdfVisning from '../../../app/components/pdf/PdfVisning';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');
jest.mock('app/hooks/useQuery', () => () => ({ get: () => '1' }));

describe('<PdfVisning>', () => {
    it('Henter journalpost og viser dokument', () => {
        const journalpostid = '200';
        const dokumentid = '123';

        const pdfVisning = shallow(
            <PdfVisning dokumenter={[{ dokumentId: dokumentid }]} journalpostId={journalpostid} />
        );

        expect(pdfVisning.find('iframe').prop('src')).toContain(journalpostid);
        expect(pdfVisning.find('iframe').prop('src')).toContain(dokumentid);
    });
});
