import React, { useState } from 'react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { FordelingDokumenttype } from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Checkbox, Input } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import { IIdentState } from 'app/models/types/IdentState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { IFellesState } from 'app/state/reducers/FellesReducer';
import { visFeilmeldingForAnnenIdentVidJournalKopi } from '../FordelingFeilmeldinger';
import JournalPostKopiFelmeldinger from './JournalPostKopiFelmeldinger';

interface IToSoekereProps {
    dokumenttype?: FordelingDokumenttype;
    journalpost: IJournalpost;
    identState: IIdentState;
    setIdentAction: typeof setIdentFellesAction;
    skalJournalpostSomIkkeStottesKopieres: boolean;
    fellesState: IFellesState;
}

const ToSoekere: React.FC<IToSoekereProps> = ({
    dokumenttype,
    journalpost,
    identState,
    skalJournalpostSomIkkeStottesKopieres,
    fellesState,
    setIdentAction,
}) => {
    const skalVises = dokumenttype === FordelingDokumenttype.PLEIEPENGER && !!journalpost?.kanKopieres;
    const intl = useIntl();
    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);
    const [annenSokerIdent, setAnnenSokerIdent] = useState<string>('');

    const handleIdentAnnenSokerBlur = (event: any) =>
        setIdentAction(identState.ident1, identState.ident2, event.target.value);
    if (!skalVises) {
        return null;
    }
    return (
        <>
            <VerticalSpacer eightPx />
            <Checkbox
                label={intlHelper(intl, 'ident.identifikasjon.tosokere')}
                onChange={(e) => {
                    setToSokereIJournalpost(e.target.checked);
                }}
            />
            <VerticalSpacer sixteenPx />
            {toSokereIJournalpost && (
                <div className="fordeling-page__to-sokere-i-journalpost">
                    <AlertStripeInfo>
                        {intlHelper(intl, 'ident.identifikasjon.infoOmRegisteringAvToSokere')}
                    </AlertStripeInfo>
                    <Input
                        label={intlHelper(intl, 'ident.identifikasjon.annenSoker')}
                        onChange={(e) => setAnnenSokerIdent(e.target.value.replace(/\D+/, ''))}
                        onBlur={handleIdentAnnenSokerBlur}
                        value={annenSokerIdent}
                        className="bold-label"
                        maxLength={11}
                        feil={visFeilmeldingForAnnenIdentVidJournalKopi(
                            identState.annenSokerIdent,
                            identState.ident1,
                            identState.ident2,
                            intl
                        )}
                        bredde="M"
                    />
                    <JournalPostKopiFelmeldinger
                        skalVisesNårJournalpostSomIkkeStottesKopieres={!skalJournalpostSomIkkeStottesKopieres}
                        fellesState={fellesState}
                        intl={intl}
                    />
                </div>
            )}
        </>
    );
};

export default ToSoekere;
