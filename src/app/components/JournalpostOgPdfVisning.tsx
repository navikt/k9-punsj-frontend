import React from 'react';
import { useIntl } from 'react-intl';
import { useQueries } from 'react-query';
import { Box } from '@navikt/ds-react';
import { ApiPath } from 'app/apiConfig';
import { JournalpostPanel } from 'app/components/journalpost-panel/JournalpostPanel';
import Page from 'app/components/page/Page';
import PdfVisning from 'app/components/pdf/PdfVisning';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import './punchPage.less';
export interface Props {
    journalposter: string[];
    children: React.ReactNode;
}

/**
 *
 * En container som vis og dokumenter knyttet til journalposter.
 */
export const JournalpostOgPdfVisning = (props: Props) => {
    const { journalposter, children } = props;
    const intl = useIntl();

    const queryObjects = journalposter.map((journalpostidentifikator) => ({
        queryKey: ['journalpost', journalpostidentifikator],
        queryFn: () =>
            get(ApiPath.JOURNALPOST_GET, { journalpostId: journalpostidentifikator }).then((res) => {
                if (!res.ok) {
                    throw new Error(`Fetch mot ${ApiPath.JOURNALPOST_GET} feilet`);
                }
                return res.json();
            }),
    }));

    const queries = useQueries(queryObjects);

    const journalpostDokumenter: IJournalpostDokumenter[] = queries.every((query) => query.isSuccess)
        ? queries.map((query) => {
              const { data } = query;
              return { journalpostid: data?.journalpostId, dokumenter: data?.dokumenter };
          })
        : [];
    const left = () => (
        <Box className="omsorgspenger_punch_form min-w-min" padding="4">
            <div className="max-w-screen-lg">
                <JournalpostPanel journalposter={journalpostDokumenter.map((v) => v.journalpostid)} />
            </div>

            <div className="max-w-screen-lg">{children}</div>
        </Box>
    );

    const right = () => !!journalpostDokumenter.length && <PdfVisning journalpostDokumenter={journalpostDokumenter} />;
    return (
        <Page title={intlHelper(intl, 'startPage.tittel')} className="punch">
            <div className="panels-wrapper" id="panels-wrapper">
                {left()}
                {right()}
            </div>
        </Page>
    );
};
