import { Alert } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import {
    FordelingDokumenttype,
    korrigeringAvInntektsmeldingSakstyper,
    omsorgspengerKroniskSyktBarnSakstyper,
    omsorgspengerMidlertidigAleneSakstyper,
    omsorgspengerUtbetalingSakstyper,
    opplæringspengerSakstyper,
    pleiepengerILivetsSluttfaseSakstyper,
    pleiepengerSakstyper,
    Sakstype,
    TilgjengeligSakstype,
} from 'app/models/enums';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    setSakstypeAction as setSakstype,
} from 'app/state/actions';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import { opprettGosysOppgave as omfordelAction } from '../../../../state/actions/GosysOppgaveActions';
import Behandlingsknapp from './Behandlingsknapp';
import { GosysGjelderKategorier } from './GoSysGjelderKategorier';

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
    gjelderPsbOmsOlp: boolean;
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
    gjelderPsbOmsOlp,
    visValgForDokument,
}) => {
    const intl = useIntl();
    const vis =
        ((fordelingState.skalTilK9 && gjelderPsbOmsOlp) || visValgForDokument) &&
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
    const omsorgspengerUtbetaling = () =>
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_UT && omsorgspengerUtbetalingSakstyper;

    const opplæringspenger = () =>
        dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER && opplæringspengerSakstyper;

    const sakstypekeys =
        korrigeringIM() ||
        pleiepengerSyktBarn() ||
        pleiepengerILivetsSluttfase() ||
        omsorgspengerKroniskSyktBarn() ||
        omsorgspengerMidlertidigAlene() ||
        omsorgspengerUtbetaling() ||
        opplæringspenger() ||
        [];

    const keys = sakstypekeys.filter((key) => {
        if (getEnvironmentVariable('SEND_BREV_OG_LUKK_OPPGAVE_FEATURE_TOGGLE') === 'false') {
            return key !== TilgjengeligSakstype.SEND_BREV;
        }
        return true;
    });
    return (
        <>
            <RadioGruppe legend={intlHelper(intl, 'fordeling.overskrift')} className="fordeling-page__options">
                {keys &&
                    keys.map((key) => {
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
                    <Alert size="small" variant="info">
                        {' '}
                        {intlHelper(intl, 'fordeling.infobox.opprettigosys')}
                    </Alert>
                    <GosysGjelderKategorier />
                </div>
            )}
            {!!fordelingState.sakstype && fordelingState.sakstype === Sakstype.SKAL_IKKE_PUNSJES && (
                <Alert size="small" variant="info">
                    {' '}
                    {intlHelper(intl, 'fordeling.infobox.lukkoppgave')}
                </Alert>
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
