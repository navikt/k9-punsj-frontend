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
import { IFellesState, kopierJournalpostUtenBarn } from '../../../../../state/reducers/FellesReducer';
import KopierModal from '../KopierModal';
import './kopiereJournalpostUtenBarn.less';

export interface IKopiereJournalpostUtenBarnStateProps {
    barnMedFagsak: Fagsak;
    intl: IntlShape;
    journalpost?: IJournalpost;
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IKopiereJournalpostUtenBarnStatePropsDispatchProps {
    kopiereJournalpostUtenBarn: typeof kopierJournalpostUtenBarn;
}

type IKopiereJournalpostUtenBarnStatePropsProps = IKopiereJournalpostUtenBarnStateProps &
    IKopiereJournalpostUtenBarnStatePropsDispatchProps;

const KopiereJournalpostUtenBarnComponent: React.FC<IKopiereJournalpostUtenBarnStatePropsProps> = (
    props: IKopiereJournalpostUtenBarnStatePropsProps,
) => {
    const { barnMedFagsak, intl, journalpost, identState, fellesState, dedupkey, kopiereJournalpostUtenBarn } = props;
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
                    kopiereJournalpostUtenBarn={kopiereJournalpostUtenBarn}
                    lukkModal={() => setVisModal(false)}
                    intl={intl}
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
    kopiereJournalpostUtenBarn: (søkerId: string, pleietrengendeId: string, journalpostId: string, dedupkey: string) =>
        dispatch(kopierJournalpostUtenBarn(søkerId, pleietrengendeId, journalpostId, dedupkey)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
});

const KopiereJournalpostUtenBarn = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(KopiereJournalpostUtenBarnComponent),
);

export { KopiereJournalpostUtenBarn, KopiereJournalpostUtenBarnComponent };
