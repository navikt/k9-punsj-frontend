import React from 'react';
import { AlertStripeFeil, AlertStripeInfo, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import intlHelper from '../../../../utils/intlUtils';
import { IFellesState } from '../../../../state/reducers/FellesReducer';

interface IOwnProps {
    skalVisesNårJournalpostSomIkkeStottesKopieres?: boolean;
    fellesState: IFellesState;
    intl: any;
}

const JournalPostKopiFelmeldinger: React.FunctionComponent<IOwnProps> = ({
    skalVisesNårJournalpostSomIkkeStottesKopieres,
    fellesState,
    intl
}) => {
    const feilmeldingSkalVises = typeof skalVisesNårJournalpostSomIkkeStottesKopieres === 'undefined' ? true : skalVisesNårJournalpostSomIkkeStottesKopieres;
    return (<>
        {feilmeldingSkalVises && fellesState.kopierJournalpostConflict &&
        <AlertStripeInfo>{intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostEksisterer')}</AlertStripeInfo>
        }

        {feilmeldingSkalVises && fellesState.kopierJournalpostSuccess &&
        <AlertStripeSuksess>{intlHelper(intl, 'ident.identifikasjon.kopiAvJournalpostOpprettet')}</AlertStripeSuksess>
        }

        {feilmeldingSkalVises && fellesState.kopierJournalpostForbidden &&
        <AlertStripeFeil>{intlHelper(intl, 'ident.identifikasjon.kopiAvJournalManglerRettigheter')}</AlertStripeFeil>
        }

        {feilmeldingSkalVises && fellesState.kopierJournalpostError &&
        <AlertStripeFeil>{intlHelper(intl, 'ident.identifikasjon.kopiAvJournalFeil')}</AlertStripeFeil>
        }
    </>);
};

export default JournalPostKopiFelmeldinger;
