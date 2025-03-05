import React, { useState } from 'react';

import { getPersonInfo } from 'app/api/api';
import VerticalSpacer from 'app/components/VerticalSpacer';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { FordelingDokumenttype, JaNei, dokumenttyperForPsbOmsOlp } from 'app/models/enums';
import { IJournalpost, Person } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';
import { erYngreEnn18år } from 'app/utils/validationHelpers';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';

interface ISokersIdentProps {
    journalpost: IJournalpost;
    identState: IIdentState;
    sokersIdent: string;
    dokumenttype?: FordelingDokumenttype;
    riktigIdentIJournalposten?: JaNei;
    erInntektsmeldingUtenKrav?: boolean;
    disableRadios?: boolean;

    handleSøkerIdChange: (event: any) => void;

    setVisSokersBarn: (event: any) => void;
    setSokersIdent: (event: any) => void;
    setIdentAction: typeof setIdentFellesAction;
    setErSøkerIdBekreftet: (event: any) => void;
    setRiktigIdentIJournalposten: (event: any) => void;
}
const SokersIdent: React.FC<ISokersIdentProps> = ({
    journalpost,
    identState,
    sokersIdent,
    dokumenttype,
    riktigIdentIJournalposten,
    erInntektsmeldingUtenKrav,
    disableRadios,

    handleSøkerIdChange,
    setVisSokersBarn,
    setSokersIdent,
    setIdentAction,
    setErSøkerIdBekreftet,
    setRiktigIdentIJournalposten,
}) => {
    const intl = useIntl();

    const [søkersInfo, setSøkersInfo] = useState<Person | undefined>(undefined);
    const [søkersInfoLoading, setSøkersInfoLoading] = useState<boolean>(false);
    const [søkersInfoError, setSøkersInfoError] = useState<boolean>(false);
    const [identErrorMessage, setIdentErrorMessage] = useState<string | undefined>(undefined);

    const skalVises = erInntektsmeldingUtenKrav || (!!dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype));
    const journalpostident = journalpost?.norskIdent;

    const handleIdentRadioChange = (jn: JaNei) => {
        setRiktigIdentIJournalposten(jn);
        setVisSokersBarn(false);
        setSøkersInfo(undefined);

        if (jn === JaNei.JA) {
            setIdentAction(journalpostident || '', '', identState.annenSokerIdent);
            if (journalpost?.norskIdent) {
                setVisSokersBarn(true);
            }
        } else {
            setSokersIdent('');
            setIdentAction('', '', identState.annenSokerIdent);
        }
    };

    const hentSøkersInfo = (søkersFødselsnummer: string) => {
        setSøkersInfoError(false);
        setSøkersInfoLoading(true);
        getPersonInfo(søkersFødselsnummer, (response, data: Person) => {
            setSøkersInfoLoading(false);
            if (response.status === 200) {
                setSøkersInfo(data);
            } else {
                setSøkersInfoError(true);
            }
        });
    };

    const checkIdentError = (ident: string): boolean => {
        if (ident) {
            if (IdentRules.erUgyldigIdent(ident)) {
                setIdentErrorMessage(intlHelper(intl, 'ident.feil.ugyldigident'));
                return true;
            }

            if (erYngreEnn18år(ident)) {
                setIdentErrorMessage(intlHelper(intl, 'ident.feil.søkerUnder18'));
                return true;
            }
        }
        setIdentErrorMessage(undefined);
        return false;
    };

    const handleSøkersIdentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleSøkerIdChange(event);

        const identFromInput = event.target.value.replace(/\D+/, '');

        if (identFromInput.length === 11 && !checkIdentError(identFromInput)) {
            hentSøkersInfo(identFromInput);
        } else {
            setSøkersInfo(undefined);
        }
    };

    if (!skalVises) {
        return null;
    }

    return (
        <>
            <VerticalSpacer sixteenPx />
            <RadioPanelGruppe
                className="horizontalRadios"
                name="identsjekk"
                radios={Object.values(JaNei).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                    disabled: jn === JaNei.NEI && disableRadios,
                    'data-test-id': `bekreftSøker-${jn}`,
                }))}
                legend={
                    <FormattedMessage
                        id="ident.identifikasjon.sjekkident"
                        values={{ ident: journalpost?.norskIdent }}
                    />
                }
                checked={riktigIdentIJournalposten}
                onChange={(event) => {
                    setErSøkerIdBekreftet((event.target as HTMLInputElement).value === JaNei.JA);
                    handleIdentRadioChange((event.target as HTMLInputElement).value as JaNei);
                }}
            />

            {riktigIdentIJournalposten === JaNei.NEI && (
                <>
                    <FnrTextField
                        label="ident.identifikasjon.felt"
                        labelId="ident.identifikasjon.felt"
                        value={sokersIdent}
                        loadingPersonsInfo={søkersInfoLoading}
                        errorPersonsInfo={søkersInfoError}
                        person={søkersInfo}
                        errorValidationMessage={identErrorMessage}
                        onChange={(event) => handleSøkersIdentChange(event)}
                    />
                </>
            )}
        </>
    );
};

export default SokersIdent;
