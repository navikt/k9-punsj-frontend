import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';
import { Alert } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import {
    FordelingDokumenttype,
    Sakstype,
    TilgjengeligSakstype,
    omsorgspengerAleneOmOmsorgenSakstyper,
    omsorgspengerKroniskSyktBarnSakstyper,
    omsorgspengerMidlertidigAleneSakstyper,
    omsorgspengerUtbetalingSakstyper,
    pleiepengerILivetsSluttfaseSakstyper,
    pleiepengerSakstyper,
} from 'app/models/enums';
import FormPanel from 'app/components/FormPanel';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import { ISakstypeDefault } from 'app/models/Sakstype';
import { Sakstyper } from 'app/containers/SakstypeImpls';
import Fagsak from 'app/types/Fagsak';
import { RootStateType } from 'app/state/RootState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    setSakstypeAction as setSakstype,
} from 'app/state/actions';
import intlHelper from 'app/utils/intlUtils';
import { IdentRules } from 'app/rules';
import { opprettGosysOppgave as omfordelAction } from '../../../../state/actions/GosysOppgaveActions';
import Behandlingsknapp from './Behandlingsknapp';
import { Pleietrengende } from './Pleietrengende';
import AnnenPart from './AnnenPart';

interface IJournalførOgFortsettStateProps {
    journalpost: IJournalpost;
    identState: IIdentState;
    fordelingState: IFordelingState;
}

interface IJournalførOgFortsettDispatchProps {
    setSakstypeAction: typeof setSakstype;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    omfordel: typeof omfordelAction;
}

type IJournalførOgFortsett = IJournalførOgFortsettStateProps & IJournalførOgFortsettDispatchProps;

const JournalførOgFortsettValg: React.FC<IJournalførOgFortsett> = (props: IJournalførOgFortsett) => {
    const {
        journalpost,
        identState,
        fordelingState,
        setSakstypeAction: sakstypeAction,
        lukkJournalpostOppgave,
        omfordel,
    } = props;

    const intl = useIntl();
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);

    const { sakstype, dokumenttype, fagsak } = fordelingState;

    const erJournalfoertEllerFerdigstilt =
        journalpost?.journalpostStatus === journalpostStatus.JOURNALFOERT ||
        journalpost?.journalpostStatus === journalpostStatus.FERDIGSTILT;

    const sakstyper: ISakstypeDefault[] = useMemo(
        () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        [],
    );

    const konfigForValgtSakstype = useMemo(() => sakstyper.find((st) => st.navn === sakstype), [sakstype]);

    const pleiepengerSyktBarn = () => dokumenttype === FordelingDokumenttype.PLEIEPENGER && pleiepengerSakstyper;

    const pleiepengerILivetsSluttfase = () =>
        dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE && pleiepengerILivetsSluttfaseSakstyper;

    const omsorgspengerKroniskSyktBarn = () =>
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS && omsorgspengerKroniskSyktBarnSakstyper;

    const omsorgspengerMidlertidigAlene = () =>
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA && omsorgspengerMidlertidigAleneSakstyper;

    const omsorgspengerAleneOmOmsorgen = () =>
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO && omsorgspengerAleneOmOmsorgenSakstyper;

    const omsorgspengerUtbetaling = () =>
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_UT && omsorgspengerUtbetalingSakstyper;

    const sakstypekeys =
        pleiepengerSyktBarn() ||
        pleiepengerILivetsSluttfase() ||
        omsorgspengerKroniskSyktBarn() ||
        omsorgspengerMidlertidigAlene() ||
        omsorgspengerAleneOmOmsorgen() ||
        omsorgspengerUtbetaling() ||
        [];

    const keys = sakstypekeys.filter((key) => {
        if (key === TilgjengeligSakstype.KLASSIFISER_OG_GAA_TIL_LOS) {
            return false;
        }
        if (key === TilgjengeligSakstype.ANNET) {
            return false;
        }

        return true;
    });

    const visPleietrengende =
        dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
        dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
        dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER ||
        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO;

    const dokumenttyperForPsbOmsOlp = [
        FordelingDokumenttype.PLEIEPENGER,
        FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
        FordelingDokumenttype.OMSORGSPENGER_KS,
        FordelingDokumenttype.OMSORGSPENGER_MA,
        FordelingDokumenttype.OMSORGSPENGER_AO,
        FordelingDokumenttype.OMSORGSPENGER_UT,
        FordelingDokumenttype.KORRIGERING_IM,
        FordelingDokumenttype.OPPLAERINGSPENGER,
    ];

    const harSak = !!journalpost.sak || !!fagsak;

    const gjelderPsbOmsOlp = dokumenttype && dokumenttyperForPsbOmsOlp.includes(dokumenttype);

    const visPleietrengendeComponent = gjelderPsbOmsOlp && !harSak;

    const visFordelingSakstype = () => {
        const dokumenttypeMedAnnenPart =
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
            identState.annenPart &&
            !IdentRules.erUgyldigIdent(identState.annenPart);

        return (
            harSak ||
            dokumenttypeMedAnnenPart ||
            barnetHarIkkeFnr ||
            !IdentRules.erUgyldigIdent(identState.pleietrengendeId)
        );
    };
    return (
        <FormPanel>
            <Alert variant="success" size="small" className="max-w-2xl mb-5">
                <FormattedMessage id="fordeling.klassifiserModal.alert.success" />
            </Alert>

            {visPleietrengendeComponent && (
                <Pleietrengende
                    pleietrengendeHarIkkeFnrFn={(harBarnetFnr: boolean) => setBarnetHarIkkeFnr(harBarnetFnr)}
                    sokersIdent={identState.søkerId}
                    skalHenteBarn={dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    visPleietrengende={visPleietrengende}
                />
            )}
            <div className="mb-5">
                <AnnenPart
                    vis={
                        (!journalpost.sak?.annenPart || !fagsak?.annenPart) &&
                        dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA
                    }
                />
            </div>

            {visFordelingSakstype() && (
                <RadioGruppe legend={intlHelper(intl, 'fordeling.overskrift')}>
                    {keys &&
                        keys.map((key) => {
                            if (key === TilgjengeligSakstype.SKAL_IKKE_PUNSJES && !erJournalfoertEllerFerdigstilt) {
                                return null;
                            }

                            return (
                                <div className="max-w-sm mb-2.5" key={key}>
                                    <RadioPanel
                                        label={intlHelper(intl, `fordeling.sakstype.${Sakstype[key]}`)}
                                        value={Sakstype[key]}
                                        onChange={() => {
                                            sakstypeAction(Sakstype[key]);
                                        }}
                                        checked={(konfigForValgtSakstype?.navn as any) === key}
                                    />
                                </div>
                            );
                        })}
                </RadioGruppe>
            )}

            <VerticalSpacer eightPx />

            {fordelingState.sakstype && fordelingState.sakstype === Sakstype.SKAL_IKKE_PUNSJES && (
                <Alert size="small" variant="info">
                    {intlHelper(intl, 'fordeling.infobox.lukkoppgave')}
                </Alert>
            )}
            <Behandlingsknapp
                norskIdent={identState.søkerId}
                omfordel={omfordel}
                lukkJournalpostOppgave={lukkJournalpostOppgave}
                journalpost={journalpost}
                sakstypeConfig={konfigForValgtSakstype as any}
                gosysKategoriJournalforing={fordelingState.valgtGosysKategori}
            />
        </FormPanel>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setSakstypeAction: (sakstype: Sakstype) => dispatch(setSakstype(sakstype)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
    omfordel: (journalpostid: string, norskIdent: string, gosysKategori: string) =>
        dispatch(omfordelAction(journalpostid, norskIdent, gosysKategori)),
});

export default connect(mapStateToProps, mapDispatchToProps)(JournalførOgFortsettValg);
