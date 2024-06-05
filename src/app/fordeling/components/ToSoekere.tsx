import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, Checkbox, TextField } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';
import { visFeilmeldingForAnnenIdentVidJournalKopi } from './FordelingFeilmeldinger';

interface IToSoekereProps {
    showComponet: boolean;
    journalpost: IJournalpost;
    identState: IIdentState;
    toSøkereIJournalpost: boolean;
    setIdentAction: typeof setIdentFellesAction;
    setToSokereIJournalpost: (toSokereIJournalpost: boolean) => void;
    disabled?: boolean;
}

const ToSoekere: React.FC<IToSoekereProps> = ({
    showComponet,
    journalpost,
    identState,
    toSøkereIJournalpost,
    setIdentAction,
    setToSokereIJournalpost,
    disabled,
}) => {
    const intl = useIntl();
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

    const disableCheckbox = () => {
        if (!journalpost.erFerdigstilt && journalpost.sak?.fagsakId) {
            return false;
        }
        return disabled;
    };

    if (!showComponet) {
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
                checked={toSøkereIJournalpost}
                disabled={disableCheckbox()}
            >
                {intlHelper(intl, 'ident.identifikasjon.tosokere')}
            </Checkbox>

            <VerticalSpacer sixteenPx />

            {toSøkereIJournalpost && (
                <div className="fordeling-page__to-sokere-i-journalpost">
                    <Alert size="small" variant="info" data-test-id="infoOmRegisteringAvToSokere">
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
