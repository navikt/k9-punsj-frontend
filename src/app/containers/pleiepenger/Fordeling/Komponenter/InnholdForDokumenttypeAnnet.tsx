import React from 'react';
import { FordelingDokumenttype } from 'app/models/enums';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { FormattedMessage, useIntl } from 'react-intl';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import { opprettGosysOppgave } from 'app/state/actions/GosysOppgaveActions';
import { IFordelingState, IJournalpost } from 'app/models/types';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';
import { Input } from 'nav-frontend-skjema';
import { IdentRules } from 'app/rules';
import { IIdentState } from 'app/models/types/IdentState';
import { useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { GosysGjelderKategorier } from './GoSysGjelderKategorier';

interface IInnholdForDokumenttypeAnnetProps {
    dokumenttype?: FordelingDokumenttype;
    journalpost: IJournalpost;
    kanJournalforingsoppgaveOpprettesiGosys: boolean;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    handleSøkerIdChange: (event: any) => void;
    handleSøkerIdBlur: (event: any) => void;
    sokersIdent: string;
    identState: IIdentState;
    fordelingState: IFordelingState;
    omfordel: typeof opprettGosysOppgave;
}

const InnholdForDokumenttypeAnnet: React.FC<IInnholdForDokumenttypeAnnetProps> = ({
    dokumenttype,
    journalpost,
    kanJournalforingsoppgaveOpprettesiGosys,
    lukkJournalpostOppgave,
    handleSøkerIdChange,
    handleSøkerIdBlur,
    sokersIdent,
    identState,
    fordelingState,
    omfordel,
}): JSX.Element | null => {
    const intl = useIntl();
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    if (dokumenttype !== FordelingDokumenttype.ANNET) {
        return null;
    }

    if (!kanJournalforingsoppgaveOpprettesiGosys) {
        return (
            <div>
                <AlertStripeInfo className="fordeling-page__kanIkkeOppretteJPIGosys">
                    <FormattedMessage id="fordeling.kanIkkeOppretteJPIGosys.info" />
                </AlertStripeInfo>
                <Knapp onClick={() => lukkJournalpostOppgave(journalpost?.journalpostId, sokersIdent, fagsak)}>
                    <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES" />
                </Knapp>
            </div>
        );
    }

    return (
        <div>
            <Input
                label={intlHelper(intl, 'ident.identifikasjon.felt')}
                onChange={handleSøkerIdChange}
                onBlur={handleSøkerIdBlur}
                value={sokersIdent}
                className="bold-label ident-soker-1"
                maxLength={11}
                feil={
                    IdentRules.erUgyldigIdent(identState.søkerId)
                        ? intlHelper(intl, 'ident.feil.ugyldigident')
                        : undefined
                }
                bredde="M"
            />
            <VerticalSpacer eightPx />
            <GosysGjelderKategorier />
            <Hovedknapp
                mini
                disabled={IdentRules.erUgyldigIdent(identState.søkerId) || !fordelingState.valgtGosysKategori}
                onClick={() =>
                    omfordel(journalpost?.journalpostId, identState.søkerId, fordelingState.valgtGosysKategori)
                }
            >
                <FormattedMessage id="fordeling.sakstype.ANNET" />
            </Hovedknapp>
        </div>
    );
};

export default InnholdForDokumenttypeAnnet;
