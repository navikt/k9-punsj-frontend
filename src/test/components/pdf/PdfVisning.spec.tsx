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
        const dokumentid = {dokumentId: '123'};
        const journalpostDokumenter = [{journalpostid, dokumenter: [dokumentid]}]
        const pdfVisning = shallow(
            
            <PdfVisning journalpostDokumenter={journalpostDokumenter} />
        );

        expect(pdfVisning.find('iframe').prop('src')).toContain(journalpostid);
        expect(pdfVisning.find('iframe').prop('src')).toContain(dokumentid);
    });
});
