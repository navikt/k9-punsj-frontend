import React, { useState } from 'react';
import { FormattedMessage, IntlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button } from '@navikt/ds-react';

import { IJournalpost } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import Fagsak from 'app/types/Fagsak';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction } from 'app/state/actions';
import VerticalSpacer from '../../../../../components/VerticalSpacer';
import PunsjInnsendingType from '../../../../../models/enums/PunsjInnsendingType';
import { IIdentState } from '../../../../../models/types/IdentState';
import { IFellesState, kopierJournalpostTilSammeSøker } from '../../../../../state/reducers/FellesReducer';
import KopierModal from '../KopierModal';
import { DokumenttypeForkortelse } from 'app/models/enums';

import './kopiereJournalpostTilSammeSøker.less';

export interface IKopiereJournalpostTilSammeSøkerStateProps {
    barnMedFagsak: Fagsak;
    intl: IntlShape;
    journalpost?: IJournalpost;
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IKopiereJournalpostTilSammeSøkerDispatchProps {
    kopiereJournalpostTilSammeSøker: typeof kopierJournalpostTilSammeSøker;
}

type IKopiereJournalpostTilSammeSøkerProps = IKopiereJournalpostTilSammeSøkerStateProps &
    IKopiereJournalpostTilSammeSøkerDispatchProps;

const KopiereJournalpostTilSammeSøkerComponent: React.FC<IKopiereJournalpostTilSammeSøkerProps> = (
    props: IKopiereJournalpostTilSammeSøkerProps,
) => {
    const { barnMedFagsak, intl, journalpost, identState, fellesState, dedupkey, kopiereJournalpostTilSammeSøker } =
        props;

    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);
    const [visModal, setVisModal] = useState(false);

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    let søkerId: string;

    if (journalpost?.norskIdent) {
        søkerId = journalpost?.norskIdent;
    } else {
        return <Alert variant="warning">{intlHelper(intl, 'ident.usignert.feil.melding')}</Alert>;
    }

    return (
        <div>
            <VerticalSpacer eightPx />

            <div className="flex">
                <div className="mr-4">
                    <Button
                        variant="secondary"
                        size="small"
                        disabled={
                            IdentRules.erUgyldigIdent(identState.pleietrengendeId) ||
                            fellesState.kopierJournalpostSuccess
                        }
                        onClick={() => {
                            if (fellesState.kopierJournalpostSuccess || erInntektsmeldingUtenKrav) {
                                setVisKanIkkeKopiere(true);
                                return;
                            }
                            if (søkerId) {
                                setVisModal(true);
                            }
                        }}
                    >
                        <FormattedMessage id="fordeling.kopiereOgLukkJournalpost" />
                    </Button>
                </div>
            </div>

            {visKanIkkeKopiere && (
                <Alert variant="warning">
                    Journalposten kan ikke kopieres. En journalpost kan kun kopieres dersom den oppfyller alle de
                    følgende kriteriene.
                    <ul>
                        <li>Må være inngående journalpost</li>
                        <li>Kan ikke være kopi av en annen journalpost</li>
                        <li>Kan ikke være inntektsmelding uten søknad</li>
                    </ul>
                </Alert>
            )}
            {visModal && (
                <KopierModal
                    søkerId={søkerId}
                    pleietrengendeId={identState.pleietrengendeId}
                    journalpostId={journalpost?.journalpostId}
                    fellesState={fellesState}
                    dedupkey={dedupkey}
                    kopiereJournalpostTilSammeSøker={kopiereJournalpostTilSammeSøker}
                    lukkModal={() => setVisModal(false)}
                    fagsakId={barnMedFagsak.fagsakId}
                />
            )}
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    identState: state.identState,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey,
});

const mapDispatchToProps = (dispatch: any) => ({
    kopiereJournalpostTilSammeSøker: (
        søkerId: string,
        pleietrengendeId: string,
        journalpostId: string,
        dedupkey: string,
        ytelse?: DokumenttypeForkortelse,
    ) => dispatch(kopierJournalpostTilSammeSøker(søkerId, pleietrengendeId, journalpostId, dedupkey, ytelse)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
});

const KopiereJournalpostTilSammeSøker = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(KopiereJournalpostTilSammeSøkerComponent),
);

export { KopiereJournalpostTilSammeSøker, KopiereJournalpostTilSammeSøkerComponent };
