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

interface Props {
    journalpost: IJournalpost;
    identState: IIdentState;
    toSokereIJournalpost: boolean;
    dokumenttype?: FordelingDokumenttype;
    disabled?: boolean;

    setIdentAction: typeof setIdentFellesAction;
    setToSokereIJournalpost: (toSokereIJournalpost: boolean) => void;
}

const ToSøkere: React.FC<Props> = ({
    journalpost,
    identState,
    toSokereIJournalpost,
    dokumenttype,
    disabled,

    setIdentAction,
    setToSokereIJournalpost,
}: Props) => {
    const intl = useIntl();

    const [annenSokerIdentLocal, setAnnenSokerIdentLocal] = useState<string>('');
    const [annenSøkersInfo, setAnnenSøkersInfo] = useState<Person | undefined>(undefined);
    const [annenSøkersInfoLoading, setAnnenSøkersInfoLoading] = useState<boolean>(false);
    const [annenSøkersInfoError, setAnnenSøkersInfoError] = useState<boolean>(false);

    const skalVises =
        dokumenttype !== FordelingDokumenttype.ANNET &&
        dokumenttype !== FordelingDokumenttype.OMSORGSPENGER &&
        !!journalpost?.kanKopieres &&
        (!journalpost.erFerdigstilt || !journalpost.kanSendeInn);

    if (!skalVises) {
        return null;
    }

    const { søkerId, pleietrengendeId, annenSokerIdent } = identState;

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

    const handleAnnenSokerIdentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const identFromInput = event.target.value.replace(/\D+/, '');

        setAnnenSøkersInfo(undefined);

        if (annenSokerIdent && annenSokerIdent.length > 0 && identFromInput.length < annenSokerIdentLocal.length) {
            setIdentAction(søkerId, pleietrengendeId);
        }

        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentAnnenSøkersInfo(identFromInput);
            }
            setIdentAction(søkerId, pleietrengendeId, identFromInput);
        }

        setAnnenSokerIdentLocal(identFromInput);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;

        setToSokereIJournalpost(checked);
        setAnnenSøkersInfo(undefined);
        setAnnenSokerIdentLocal('');

        if (!checked) {
            setIdentAction(søkerId, pleietrengendeId, null);
        }
    };

    const disableCheckbox = () => {
        if (!journalpost.erFerdigstilt && journalpost.sak?.fagsakId) {
            return false;
        }

        return disabled;
    };

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
                        value={annenSokerIdentLocal}
                        loadingPersonsInfo={annenSøkersInfoLoading}
                        errorPersonsInfo={annenSøkersInfoError}
                        person={annenSøkersInfo}
                        errorValidationMessage={visFeilmeldingForAnnenIdentVidJournalKopi(intl, identState)}
                        onChange={handleAnnenSokerIdentChange}
                    />
                </div>
            )}
        </>
    );
};

export default ToSøkere;
