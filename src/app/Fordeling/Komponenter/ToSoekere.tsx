import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Checkbox } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { FordelingDokumenttype } from 'app/models/enums';
import { IJournalpost, Person } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { visFeilmeldingForAnnenIdentVidJournalKopi } from './FordelingFeilmeldinger';
import { getPersonInfo } from 'app/api/api';
import { IdentRules } from 'app/rules';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';

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

    const [annenSokerIdent, setAnnenSokerIdent] = useState<string>('');
    const [annenSøkersInfo, setAnnenSøkersInfo] = useState<Person | undefined>(undefined);
    const [annenSøkersInfoLoading, setAnnenSøkersInfoLoading] = useState<boolean>(false);
    const [annenSøkersInfoError, setAnnenSøkersInfoError] = useState<boolean>(false);

    const skalVises =
        dokumenttype !== FordelingDokumenttype.ANNET &&
        dokumenttype !== FordelingDokumenttype.OMSORGSPENGER &&
        !!journalpost?.kanKopieres &&
        (!journalpost.erFerdigstilt || !journalpost.kanSendeInn);

    const hentAnnenSøkersInfo = (søkersFødselsnummer: string) => {
        setAnnenSøkersInfoError(false);
        setAnnenSøkersInfoLoading(true);
        getPersonInfo(søkersFødselsnummer, (response, data: Person) => {
            setAnnenSøkersInfoLoading(false);
            if (response.status === 200) {
                setAnnenSøkersInfo(data);
            } else {
                setAnnenSøkersInfoError(true);
            }
        });
    };

    const handleIdentAnnenSoker = (event: React.ChangeEvent<HTMLInputElement>) => {
        const identFromInput = event.target.value.replace(/\D+/, '');
        setAnnenSøkersInfo(undefined);
        if (annenSokerIdent.length > 0 && identFromInput.length < annenSokerIdent.length) {
            setIdentAction(identState.søkerId, identState.pleietrengendeId);
        }

        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentAnnenSøkersInfo(identFromInput);
            }
            setIdentAction(identState.søkerId, identState.pleietrengendeId, identFromInput);
        }

        setAnnenSokerIdent(identFromInput);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;

        setToSokereIJournalpost(checked);
        setAnnenSøkersInfo(undefined);
        setAnnenSokerIdent('');
        if (!checked) {
            setIdentAction(identState.søkerId, identState.pleietrengendeId, null);
        }
    };

    const disableCheckbox = () => {
        if (!journalpost.erFerdigstilt && journalpost.sak?.fagsakId) {
            return false;
        }
        return disabled;
    };

    if (!skalVises) {
        return null;
    }

    return (
        <>
            <VerticalSpacer eightPx />

            <Checkbox
                onChange={handleCheckboxChange}
                checked={toSokereIJournalpost}
                disabled={disableCheckbox()}
                data-test-id="toSokereCheckbox"
            >
                <FormattedMessage
                    id={
                        journalpost.erFerdigstilt
                            ? 'ident.identifikasjon.tosokere.behandlet'
                            : 'ident.identifikasjon.tosokere'
                    }
                />
            </Checkbox>

            <VerticalSpacer sixteenPx />

            {toSokereIJournalpost && (
                <div className="fordeling-page__to-sokere-i-journalpost">
                    <Alert size="small" variant="info" data-test-id="infoOmRegisteringAvToSokere">
                        <FormattedMessage
                            id={
                                journalpost.erFerdigstilt
                                    ? 'ident.identifikasjon.infoOmRegisteringAvToSokere.behandlet'
                                    : 'ident.identifikasjon.infoOmRegisteringAvToSokere'
                            }
                        />
                    </Alert>

                    <FnrTextField
                        labelId="ident.identifikasjon.annenSoker"
                        value={annenSokerIdent}
                        loadingPersonsInfo={annenSøkersInfoLoading}
                        errorPersonsInfo={annenSøkersInfoError}
                        person={annenSøkersInfo}
                        errorValidationMessage={visFeilmeldingForAnnenIdentVidJournalKopi(intl, identState)}
                        onChange={handleIdentAnnenSoker}
                    />
                </div>
            )}
        </>
    );
};

export default ToSoekere;
