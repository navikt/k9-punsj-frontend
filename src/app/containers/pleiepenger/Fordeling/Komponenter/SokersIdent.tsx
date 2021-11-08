import React, { useState } from 'react';
import { FordelingDokumenttype, JaNei } from 'app/models/enums';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Input, RadioPanelGruppe } from 'nav-frontend-skjema';
import intlHelper from 'app/utils/intlUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { erUgyldigIdent } from '../FordelingFeilmeldinger';

interface ISokersIdentProps {
    dokumenttype?: FordelingDokumenttype;
    journalpost: IJournalpost;
    handleIdent1Change: (event: any) => void;
    handleIdent1Blur: (event: any) => void;
    setVisSokersBarn: (event: any) => void;
    setSokersIdent: (event: any) => void;
    setIdentAction: typeof setIdentFellesAction;
    setErIdent1Bekreftet: (event: any) => void;
    setRiktigIdentIJournalposten: (event: any) => void;
    sokersIdent: string;
    identState: IIdentState;
    riktigIdentIJournalposten?: JaNei;
}
const SokersIdent: React.FC<ISokersIdentProps> = ({
    dokumenttype,
    journalpost,
    handleIdent1Change,
    handleIdent1Blur,
    sokersIdent,
    identState,
    setVisSokersBarn,
    setSokersIdent,
    setIdentAction,
    setErIdent1Bekreftet,
    setRiktigIdentIJournalposten,
    riktigIdentIJournalposten,
}) => {
    const skalVises =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER || dokumenttype === FordelingDokumenttype.KORRIGERING_IM;
    const journalpostident = journalpost?.norskIdent;

    const handleIdentRadioChange = (jn: JaNei) => {
        setRiktigIdentIJournalposten(jn);
        setVisSokersBarn(false);
        if (jn === JaNei.JA) {
            setIdentAction(journalpostident || '', identState.ident2);
            if (journalpost?.norskIdent) {
                setVisSokersBarn(true);
            }
        } else {
            setSokersIdent('');
            setIdentAction('', identState.ident2);
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
                    setErIdent1Bekreftet((event.target as HTMLInputElement).value === JaNei.JA);
                    handleIdentRadioChange((event.target as HTMLInputElement).value as JaNei);
                }}
            />

            {riktigIdentIJournalposten === JaNei.NEI && (
                <>
                    <VerticalSpacer sixteenPx />
                    <Input
                        label={intlHelper(intl, 'ident.identifikasjon.felt')}
                        onChange={handleIdent1Change}
                        onBlur={handleIdent1Blur}
                        value={sokersIdent}
                        className="bold-label ident-soker-1"
                        maxLength={11}
                        feil={
                            identState.ident1 && erUgyldigIdent(identState.ident1)
                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                : undefined
                        }
                        bredde="M"
                    />
                </>
            )}
        </>
    );
};

export default SokersIdent;
