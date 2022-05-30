import React from 'react';

import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';

import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    setSakstypeAction as setSakstype,
} from 'app/state/actions';

import VerticalSpacer from 'app/components/VerticalSpacer';
import {
    FordelingDokumenttype,
    korrigeringAvInntektsmeldingSakstyper,
    omsorgspengerKroniskSyktBarnSakstyper,
    pleiepengerILivetsSluttfaseSakstyper,
    omsorgspengerMidlertidigAleneSakstyper,
    pleiepengerSakstyper,
    Sakstype,
    TilgjengeligSakstype,
} from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import Behandlingsknapp from './Behandlingsknapp';
import { GosysGjelderKategorier } from './GoSysGjelderKategorier';
import { opprettGosysOppgave as omfordelAction } from '../../../../state/actions/GosysOppgaveActions';

interface IValgForDokument {
    dokumenttype?: FordelingDokumenttype;
    journalpost: IJournalpost;
    erJournalfoertEllerFerdigstilt: boolean;
    kanJournalforingsoppgaveOpprettesiGosys: boolean;
    identState: IIdentState;
    konfigForValgtSakstype: any;
    visValgForDokument: boolean;
    fordelingState: IFordelingState;
    setSakstypeAction: typeof setSakstype;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    omfordel: typeof omfordelAction;
    gjelderPleiepengerEllerOmsorgspenger: boolean;
}

const ValgForDokument: React.FC<IValgForDokument> = ({
    dokumenttype,
    erJournalfoertEllerFerdigstilt,
    kanJournalforingsoppgaveOpprettesiGosys,
    setSakstypeAction,
    konfigForValgtSakstype,
    fordelingState,
    identState,
    omfordel,
    journalpost,
    lukkJournalpostOppgave,
    gjelderPleiepengerEllerOmsorgspenger,
    visValgForDokument,
}) => {
    const intl = useIntl();
    const vis =
        ((fordelingState.skalTilK9 && gjelderPleiepengerEllerOmsorgspenger) || visValgForDokument) &&
        dokumenttype !== FordelingDokumenttype.ANNET;

    if (!vis) {
        return null;
    }

    function korrigeringIM() {
        return dokumenttype === FordelingDokumenttype.KORRIGERING_IM && korrigeringAvInntektsmeldingSakstyper;
    }

    function pleiepengerSyktBarn() {
        return dokumenttype === FordelingDokumenttype.PLEIEPENGER && pleiepengerSakstyper;
    }

    function pleiepengerILivetsSluttfase() {
        return (
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE &&
            pleiepengerILivetsSluttfaseSakstyper
        );
    }

    function omsorgspengerKroniskSyktBarn() {
        return dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS && omsorgspengerKroniskSyktBarnSakstyper;
    }
    function omsorgspengerMidlertidigAlene() {
        return dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA && omsorgspengerMidlertidigAleneSakstyper;
    }

    return (
        <>
            <RadioGruppe legend={intlHelper(intl, 'fordeling.overskrift')} className="fordeling-page__options">
                {(
                    korrigeringIM() ||
                    pleiepengerSyktBarn() ||
                    pleiepengerILivetsSluttfase() ||
                    omsorgspengerKroniskSyktBarn() ||
                    omsorgspengerMidlertidigAlene()
                ).map((key) => {
                    if (key === TilgjengeligSakstype.SKAL_IKKE_PUNSJES && !erJournalfoertEllerFerdigstilt) {
                        return null;
                    }
                    if (!(key === TilgjengeligSakstype.ANNET && !kanJournalforingsoppgaveOpprettesiGosys)) {
                        return (
                            <RadioPanel
                                key={key}
                                label={intlHelper(intl, `fordeling.sakstype.${Sakstype[key]}`)}
                                value={Sakstype[key]}
                                onChange={() => {
                                    setSakstypeAction(Sakstype[key]);
                                }}
                                checked={konfigForValgtSakstype?.navn === key}
                            />
                        );
                    }
                    return null;
                })}
            </RadioGruppe>
            <VerticalSpacer eightPx />
            {!!fordelingState.sakstype && fordelingState.sakstype === Sakstype.ANNET && (
                <div className="fordeling-page__gosysGjelderKategorier">
                    <AlertStripeInfo> {intlHelper(intl, 'fordeling.infobox.opprettigosys')}</AlertStripeInfo>
                    <GosysGjelderKategorier />
                </div>
            )}
            {!!fordelingState.sakstype && fordelingState.sakstype === Sakstype.SKAL_IKKE_PUNSJES && (
                <AlertStripeInfo> {intlHelper(intl, 'fordeling.infobox.lukkoppgave')}</AlertStripeInfo>
            )}
            <Behandlingsknapp
                norskIdent={identState.ident1}
                omfordel={omfordel}
                lukkJournalpostOppgave={lukkJournalpostOppgave}
                journalpost={journalpost}
                sakstypeConfig={konfigForValgtSakstype}
                gosysKategoriJournalforing={fordelingState.valgtGosysKategori}
            />
        </>
    );
};

export default ValgForDokument;
