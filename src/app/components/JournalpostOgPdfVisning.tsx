import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useQueries } from '@tanstack/react-query';
import { Box } from '@navikt/ds-react';
import { ApiPath } from 'app/apiConfig';
import { JournalpostPanel } from 'app/components/journalpost-panel/JournalpostPanel';
import Page from 'app/components/page/Page';
import PdfVisning from 'app/components/pdf/PdfVisning';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import './punchPage.less';
import '../styles/journalpostModal.less';

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
    const leftPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateLeftPanelWidth = () => {
            if (leftPanelRef.current) {
                const width = leftPanelRef.current.offsetWidth;
                document.documentElement.style.setProperty('--left-panel-width', `${width}px`);
            }
        };

        // Initial update
        updateLeftPanelWidth();

        // Create ResizeObserver to watch for size changes
        const resizeObserver = new ResizeObserver(updateLeftPanelWidth);
        if (leftPanelRef.current) {
            resizeObserver.observe(leftPanelRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

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

    const queries = useQueries({ queries: queryObjects });

    const journalpostDokumenter: IJournalpostDokumenter[] = queries.every((query) => query.isSuccess)
        ? queries.map((query) => {
              const { data } = query;
              return { journalpostid: data?.journalpostId, dokumenter: data?.dokumenter };
          })
        : [];
    const left = () => (
        <Box ref={leftPanelRef} className="omsorgspenger_punch_form min-w-min" padding="4">
            <div className="max-w-screen-lg">
                <JournalpostPanel journalposter={journalpostDokumenter.map((v) => v.journalpostid)} />
            </div>

            <div className="max-w-screen-lg">{children}</div>
        </Box>
    );

    const right = () => !!journalpostDokumenter.length && <PdfVisning journalpostDokumenter={journalpostDokumenter} />;
    return (
        <Page title={intlHelper(intl, 'startPage.tittel')} className="punch journalpost-modal">
            <div className="panels-wrapper" id="panels-wrapper">
                {left()}
                {right()}
            </div>
        </Page>
    );
};
