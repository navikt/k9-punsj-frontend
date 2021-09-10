import React from 'react';
import { AlertStripeFeil, AlertStripeInfo, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import intlHelper from '../../../../utils/intlUtils';
import { IFellesState } from '../../../../state/reducers/FellesReducer';

interface IOwnProps {
    skalVisesNårJournalpostSomIkkeStottesKopieres: boolean;
    fellesState: IFellesState;
    intl: any;
}

const JournalPostKopiFelmeldinger: React.FunctionComponent<IOwnProps> = ({
    skalVisesNårJournalpostSomIkkeStottesKopieres,
    fellesState,
    intl,
}) => {
    return (
        <>
            {skalVisesNårJournalpostSomIkkeStottesKopieres && fellesState.kopierJournalpostConflict && (
                <AlertStripeInfo>
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostEksisterer')}
                </AlertStripeInfo>
            )}

            {skalVisesNårJournalpostSomIkkeStottesKopieres && fellesState.kopierJournalpostSuccess && (
                <AlertStripeSuksess>
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostOpprettet')}
                </AlertStripeSuksess>
            )}

            {skalVisesNårJournalpostSomIkkeStottesKopieres && fellesState.kopierJournalpostForbidden && (
                <AlertStripeFeil>
                    {intlHelper(intl, 'ident.identifikasjon.kopiAvJournalManglerRettigheter')}
                </AlertStripeFeil>
            )}

            {skalVisesNårJournalpostSomIkkeStottesKopieres && fellesState.kopierJournalpostError && (
                <AlertStripeFeil>{intlHelper(intl, 'ident.identifikasjon.kopiAvJournalFeil')}</AlertStripeFeil>
            )}
        </>
    );
};

export default JournalPostKopiFelmeldinger;
