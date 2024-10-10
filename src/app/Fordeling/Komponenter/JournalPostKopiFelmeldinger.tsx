import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert } from '@navikt/ds-react';
import { IFellesState } from 'app/state/reducers/FellesReducer';

interface Props {
    fellesState: IFellesState;
}

const JournalPostKopiFelmeldinger: React.FC<Props> = ({ fellesState }) => {
    const { kopierJournalpostSuccess, kopierJournalpostConflict, kopierJournalpostForbidden, kopierJournalpostError } =
        fellesState;

    return (
        <>
            {kopierJournalpostConflict && (
                <Alert size="small" variant="info" data-test-id="kopierJournalpostConflict">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalpostEksisterer" />
                </Alert>
            )}

            {kopierJournalpostSuccess && (
                <Alert size="small" variant="success" data-test-id="kopiAvJournalpostOpprettet">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalpostOpprettet" />
                </Alert>
            )}

            {kopierJournalpostForbidden && (
                <Alert size="small" variant="error" data-test-id="kopiAvJournalManglerRettigheter">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalManglerRettigheter" />
                </Alert>
            )}

            {kopierJournalpostError && (
                <Alert size="small" variant="error" data-test-id="kopierJournalpostError">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalFeil" />
                </Alert>
            )}
        </>
    );
};

export default JournalPostKopiFelmeldinger;
