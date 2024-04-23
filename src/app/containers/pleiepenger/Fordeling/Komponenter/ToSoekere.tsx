import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { Alert, Checkbox, TextField } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { FordelingDokumenttype } from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';

import { visFeilmeldingForAnnenIdentVidJournalKopi } from '../FordelingFeilmeldinger';

interface IToSoekereProps {
    dokumenttype?: FordelingDokumenttype;
    journalpost: IJournalpost;
    identState: IIdentState;
    setIdentAction: typeof setIdentFellesAction;
    disabled?: boolean;
}

const ToSoekere: React.FC<IToSoekereProps> = ({ dokumenttype, journalpost, identState, disabled, setIdentAction }) => {
    const intl = useIntl();
    const skalVises =
        (dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) &&
        !!journalpost?.kanKopieres;

    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);
    const [annenSokerIdent, setAnnenSokerIdent] = useState<string>('');

    const handleIdentAnnenSokerBlur = (event: any) =>
        setIdentAction(identState.søkerId, identState.pleietrengendeId, event.target.value);
    if (!skalVises) {
        return null;
    }

    return (
        <>
            <VerticalSpacer eightPx />
            <Checkbox
                onChange={(e) => {
                    setToSokereIJournalpost(e.target.checked);
                    if (!e.target.checked) {
                        setIdentAction(identState.søkerId, identState.pleietrengendeId, null);
                        setAnnenSokerIdent('');
                    }
                }}
                disabled={disabled}
            >
                {intlHelper(intl, 'ident.identifikasjon.tosokere')}
            </Checkbox>
            <VerticalSpacer sixteenPx />
            {toSokereIJournalpost && (
                <div className="fordeling-page__to-sokere-i-journalpost">
                    <Alert size="small" variant="info">
                        {intlHelper(intl, 'ident.identifikasjon.infoOmRegisteringAvToSokere')}
                    </Alert>
                    <TextField
                        label={intlHelper(intl, 'ident.identifikasjon.annenSoker')}
                        onChange={(e) => setAnnenSokerIdent(e.target.value.replace(/\D+/, ''))}
                        onBlur={handleIdentAnnenSokerBlur}
                        value={annenSokerIdent}
                        className="bold-label"
                        maxLength={11}
                        error={visFeilmeldingForAnnenIdentVidJournalKopi(
                            identState.annenSokerIdent,
                            identState.søkerId,
                            identState.pleietrengendeId,
                            intl,
                        )}
                    />
                </div>
            )}
        </>
    );
};

export default ToSoekere;
