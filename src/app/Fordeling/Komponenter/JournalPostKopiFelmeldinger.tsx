import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert } from '@navikt/ds-react';
import { IFellesState } from '../../../../state/reducers/FellesReducer';

interface Props {
    fellesState: IFellesState;
}

const JournalPostKopiFelmeldinger: React.FC<Props> = ({ fellesState }) => {
    const { kopierJournalpostSuccess, kopierJournalpostConflict, kopierJournalpostForbidden, kopierJournalpostError } =
        fellesState;

    return (
        <>
            {kopierJournalpostConflict && (
                <Alert size="small" variant="info">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalpostEksisterer" />
                </Alert>
            )}

            {kopierJournalpostSuccess && (
                <Alert size="small" variant="success">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalpostOpprettet" />
                </Alert>
            )}

            {kopierJournalpostForbidden && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalManglerRettigheter" />
                </Alert>
            )}

            {kopierJournalpostError && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="ident.identifikasjon.kopiAvJournalFeil" />
                </Alert>
            )}
        </>
    );
};

export default JournalPostKopiFelmeldinger;
