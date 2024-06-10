import React, { useEffect, useMemo } from 'react';

import { Alert } from '@navikt/ds-react';
import { RadioGruppe, RadioPanel } from 'nav-frontend-skjema';

import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
import FormPanel from 'app/components/formpanel/FormPanel';
import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
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
    korrigeringAvInntektsmeldingSakstyper,
} from 'app/models/enums';
import Fagsak from 'app/types/Fagsak';
import { IFordelingState, IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { ISakstypeDefault } from 'app/models/Sakstype';
import { Sakstyper } from 'app/types/SakstypeImpls';
import { RootStateType } from 'app/state/RootState';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    setSakstypeAction as setSakstype,
} from 'app/state/actions';
import intlHelper from 'app/utils/intlUtils';
import { IdentRules } from 'app/rules';
import { ROUTES } from 'app/constants/routes';
import Behandlingsknapp from './Behandlingsknapp';
import { opprettGosysOppgave as omfordelAction } from '../../state/actions/GosysOppgaveActions';

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
    const navigate = useNavigate();

    const { sakstype, dokumenttype, fagsak } = fordelingState;

    // Navigerer til journalpost ROOT hvis sakstype eller dokumenttype mangler i fordelingState ved oppdatering av side
    useEffect(() => {
        if (!sakstype && !dokumenttype) {
            navigate(ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId));
        }
    }, []);

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

    const korrigeringIM = () =>
        dokumenttype === FordelingDokumenttype.KORRIGERING_IM && korrigeringAvInntektsmeldingSakstyper;

    const sakstypekeys =
        pleiepengerSyktBarn() ||
        pleiepengerILivetsSluttfase() ||
        omsorgspengerKroniskSyktBarn() ||
        omsorgspengerMidlertidigAlene() ||
        omsorgspengerAleneOmOmsorgen() ||
        omsorgspengerUtbetaling() ||
        korrigeringIM() ||
        [];

    const keys = sakstypekeys.filter((key) => {
        if (key === TilgjengeligSakstype.KLASSIFISER_OG_GAA_TIL_LOS) {
            return false;
        }
        if (key === TilgjengeligSakstype.ANNET) {
            return false;
        }

        if (key === TilgjengeligSakstype.SKAL_IKKE_PUNSJES) {
            return false;
        }

        return true;
    });

    const visFordelingSakstype = () => {
        const dokumenttypeMedAnnenPart =
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA &&
            identState.annenPart &&
            !IdentRules.erUgyldigIdent(identState.annenPart);

        if (!dokumenttypeMedAnnenPart) {
            return true;
        }

        return dokumenttypeMedAnnenPart;
    };

    const visPleietrengendeVarsel =
        (dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
            dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
            dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER ||
            dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO) &&
        !identState.pleietrengendeId;

    const erSaksnummerReservert = journalpost.sak?.reservertSaksnummer || fagsak?.reservertSaksnummer;

    // men har ikke info om at saksnummer reservert hvis bruker kommer hit rett etter klassifisering
    // Hvis bruker kommer hit fra los så har vi info om at saksnummer reservert
    return (
        <FormPanel>
            <div className="max-w-md">
                {!erSaksnummerReservert && (
                    <Alert variant="success" size="small" className="mb-5" data-test-id="alertJournalført">
                        <FormattedMessage id="fordeling.journalført.alert.success" />
                    </Alert>
                )}

                {erSaksnummerReservert && (
                    <Alert variant="success" size="small" className="mb-5" data-test-id="alertJournalførtReservert">
                        <FormattedMessage
                            id="fordeling.journalført.alert.success.reservert"
                            values={{ saksnummer: fagsak?.fagsakId || '' }}
                        />
                    </Alert>
                )}

                {visPleietrengendeVarsel && (
                    <div className="mb-5">
                        <Alert
                            size="small"
                            variant="info"
                            className="max-w-2xl mb-5"
                            data-test-id="pleietrengendeHarIkkeFnrInformasjon"
                        >
                            <FormattedMessage id="ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon" />
                        </Alert>
                    </div>
                )}

                {visFordelingSakstype() && (
                    <RadioGruppe legend={intlHelper(intl, 'fordeling.overskrift')}>
                        {keys &&
                            keys.map((key) => (
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
                            ))}
                    </RadioGruppe>
                )}

                <VerticalSpacer eightPx />

                {fordelingState.sakstype && fordelingState.sakstype === Sakstype.SKAL_IKKE_PUNSJES && (
                    <>
                        <Alert size="small" variant="info">
                            {intlHelper(intl, 'fordeling.infobox.lukkoppgave')}
                        </Alert>
                        <VerticalSpacer eightPx />
                    </>
                )}
            </div>

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
