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
    journalpost: IJournalpost;
    identState: IIdentState;
    toSokereIJournalpost: boolean;
    setIdentAction: typeof setIdentFellesAction;
    setToSokereIJournalpost: (toSokereIJournalpost: boolean) => void;
    dokumenttype?: FordelingDokumenttype;
    disabled?: boolean;
}

const ToSoekere: React.FC<IToSoekereProps> = ({
    journalpost,
    identState,
    toSokereIJournalpost,
    setIdentAction,
    setToSokereIJournalpost,
    dokumenttype,
    disabled,
}) => {
    const intl = useIntl();
    const skalVises =
        (dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) &&
        !!journalpost?.kanKopieres &&
        !journalpost.erFerdigstilt;

    const [annenSokerIdent, setAnnenSokerIdent] = useState<string>('');

    const handleIdentAnnenSoker = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ident = event.target.value.replace(/\D+/, '');

        if (annenSokerIdent.length > 0 && ident.length < annenSokerIdent.length) {
            setIdentAction(identState.søkerId, identState.pleietrengendeId);
        }

        if (ident.length === 11) {
            setIdentAction(identState.søkerId, identState.pleietrengendeId, event.target.value);
        }
        setAnnenSokerIdent(ident);
    };

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
                checked={toSokereIJournalpost}
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
                        onChange={handleIdentAnnenSoker}
                        className="bold-label"
                        maxLength={11}
                        autoComplete="off"
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
