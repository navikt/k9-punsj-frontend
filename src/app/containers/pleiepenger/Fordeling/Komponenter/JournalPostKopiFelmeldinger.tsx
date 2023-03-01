import { Alert } from '@navikt/ds-react';
import React from 'react';
import { IFellesState } from '../../../../state/reducers/FellesReducer';
import intlHelper from '../../../../utils/intlUtils';

interface IOwnProps {
    skalVisesNårJournalpostSomIkkeStottesKopieres?: boolean;
    fellesState: IFellesState;
    intl: any;
}

const JournalPostKopiFelmeldinger: React.FunctionComponent<IOwnProps> = ({
    skalVisesNårJournalpostSomIkkeStottesKopieres,
    fellesState,
    intl,
}) => {
    const feilmeldingSkalVises = !skalVisesNårJournalpostSomIkkeStottesKopieres
        ? true
        : skalVisesNårJournalpostSomIkkeStottesKopieres;
    return (
        <>
            {feilmeldingSkalVises && fellesState.kopierJournalpostConflict && (
                <Alert size="small" variant="info">
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostEksisterer')}
                </Alert>
            )}

            {feilmeldingSkalVises && fellesState.kopierJournalpostSuccess && (
                <Alert size="small" variant="success">
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostOpprettet')}
                </Alert>
            )}

            {feilmeldingSkalVises && fellesState.kopierJournalpostForbidden && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalManglerRettigheter')}
                </Alert>
            )}

            {feilmeldingSkalVises && fellesState.kopierJournalpostError && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalFeil')}
                </Alert>
            )}
        </>
    );
};

export default JournalPostKopiFelmeldinger;
