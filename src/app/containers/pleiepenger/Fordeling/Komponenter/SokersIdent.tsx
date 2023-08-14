import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { TextField } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { FordelingDokumenttype, JaNei } from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';

interface ISokersIdentProps {
    dokumenttype?: FordelingDokumenttype;
    journalpost: IJournalpost;
    handleSøkerIdChange: (event: any) => void;
    handleSøkerIdBlur: (event: any) => void;
    setVisSokersBarn: (event: any) => void;
    setSokersIdent: (event: any) => void;
    setIdentAction: typeof setIdentFellesAction;
    setErSøkerIdBekreftet: (event: any) => void;
    setRiktigIdentIJournalposten: (event: any) => void;
    sokersIdent: string;
    identState: IIdentState;
    riktigIdentIJournalposten?: JaNei;
    erInntektsmeldingUtenKrav?: boolean;
}
const SokersIdent: React.FC<ISokersIdentProps> = ({
    dokumenttype,
    journalpost,
    handleSøkerIdChange,
    handleSøkerIdBlur,
    sokersIdent,
    identState,
    setVisSokersBarn,
    setSokersIdent,
    setIdentAction,
    setErSøkerIdBekreftet,
    setRiktigIdentIJournalposten,
    riktigIdentIJournalposten,
    erInntektsmeldingUtenKrav,
}) => {
    const relevanteDokumenttyper = [
        FordelingDokumenttype.PLEIEPENGER,
        FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
        FordelingDokumenttype.OMSORGSPENGER_KS,
        FordelingDokumenttype.OMSORGSPENGER_MA,
        FordelingDokumenttype.OMSORGSPENGER_UT,
        FordelingDokumenttype.OMSORGSPENGER_AO,
        FordelingDokumenttype.KORRIGERING_IM,
        FordelingDokumenttype.OPPLAERINGSPENGER,
    ];
    const skalVises = erInntektsmeldingUtenKrav || (!!dokumenttype && relevanteDokumenttyper.includes(dokumenttype));

    const journalpostident = journalpost?.norskIdent;

    const handleIdentRadioChange = (jn: JaNei) => {
        setRiktigIdentIJournalposten(jn);
        setVisSokersBarn(false);
        if (jn === JaNei.JA) {
            setIdentAction(journalpostident || '', identState.pleietrengendeId);
            if (journalpost?.norskIdent) {
                setVisSokersBarn(true);
            }
        } else {
            setSokersIdent('');
            setIdentAction('', identState.pleietrengendeId);
        }
    };

    const intl = useIntl();

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
                    <VerticalSpacer sixteenPx />
                    <TextField
                        label={intlHelper(intl, 'ident.identifikasjon.felt')}
                        onChange={handleSøkerIdChange}
                        onBlur={handleSøkerIdBlur}
                        value={sokersIdent}
                        className="bold-label ident-soker-1"
                        maxLength={11}
                        error={
                            identState.søkerId && IdentRules.erUgyldigIdent(identState.søkerId)
                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                : undefined
                        }
                    />
                </>
            )}
        </>
    );
};

export default SokersIdent;
