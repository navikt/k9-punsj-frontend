import React from 'react';

import { Alert } from '@navikt/ds-react';

import { IFellesState } from '../../state/reducers/FellesReducer';
import intlHelper from '../../utils/intlUtils';

interface IOwnProps {
    fellesState: IFellesState;
    intl: any;
}

const JournalPostKopiFelmeldinger: React.FunctionComponent<IOwnProps> = ({ fellesState, intl }) => (
    <>
        {fellesState.kopierJournalpostConflict && (
            <Alert size="small" variant="info">
                {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostEksisterer')}
            </Alert>
        )}

        {fellesState.kopierJournalpostSuccess && (
            <Alert size="small" variant="success">
                {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostOpprettet')}
            </Alert>
        )}

        {fellesState.kopierJournalpostForbidden && (
            <Alert size="small" variant="error">
                {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalManglerRettigheter')}
            </Alert>
        )}

        {fellesState.kopierJournalpostError && (
            <Alert size="small" variant="error">
                {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalFeil')}
            </Alert>
        )}
    </>
);

export default JournalPostKopiFelmeldinger;
