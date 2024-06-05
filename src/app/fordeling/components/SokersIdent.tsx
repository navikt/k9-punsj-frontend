import React from 'react';
import { TextField } from '@navikt/ds-react';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNei } from 'app/models/enums';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/rules';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';

interface ISokersIdentProps {
    showComponent: boolean;
    journalpost: IJournalpost;
    identState: IIdentState;
    sokersIdent: string;
    riktigIdentIJournalposten?: JaNei;
    disableRadios?: boolean;

    handleSøkerIdChange: (event: any) => void;
    setVisSokersBarn: (event: any) => void;
    setSokersIdent: (event: any) => void;
    setIdentAction: typeof setIdentFellesAction;
    setErSøkerIdBekreftet: (event: any) => void;
    setRiktigIdentIJournalposten: (event: any) => void;
}

const SokersIdent: React.FC<ISokersIdentProps> = ({
    showComponent,
    journalpost,
    identState,
    sokersIdent,
    riktigIdentIJournalposten,
    disableRadios,

    handleSøkerIdChange,
    setVisSokersBarn,
    setSokersIdent,
    setIdentAction,
    setErSøkerIdBekreftet,
    setRiktigIdentIJournalposten,
}) => {
    const intl = useIntl();
    const journalpostident = journalpost?.norskIdent;

    const handleIdentRadioChange = (jn: JaNei) => {
        setRiktigIdentIJournalposten(jn);
        setVisSokersBarn(false);

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

    if (!showComponent) {
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
                        autoComplete="off"
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
