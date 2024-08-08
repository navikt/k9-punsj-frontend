import React, { useState } from 'react';
import { FormattedMessage, IntlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button } from '@navikt/ds-react';

import Kopier from 'app/components/kopier/Kopier';
import { IJournalpost } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../../../../components/VerticalSpacer';
import PunsjInnsendingType from '../../../../../models/enums/PunsjInnsendingType';
import { IIdentState } from '../../../../../models/types/IdentState';
import { IFellesState, kopierJournalpost } from '../../../../../state/reducers/FellesReducer';
import { getEnvironmentVariable } from '../../../../../utils';
import JournalPostKopiFelmeldinger from '../JournalPostKopiFelmeldinger';
import { Pleietrengende } from '../Pleietrengende';
import './journalpostAlleredeBehandlet.less';

export interface IJournalpostAlleredeBehandletStateProps {
    intl: IntlShape;
    journalpost?: IJournalpost;
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IJournalpostAlleredeBehandletDispatchProps {
    kopiereJournalpost: typeof kopierJournalpost;
}

type IJournalpostAlleredeBehandletProps = IJournalpostAlleredeBehandletStateProps &
    IJournalpostAlleredeBehandletDispatchProps;

const JournalpostAlleredeBehandletComponent: React.FunctionComponent<IJournalpostAlleredeBehandletProps> = (
    props: IJournalpostAlleredeBehandletProps,
) => {
    const { intl, journalpost, identState, fellesState, dedupkey, kopiereJournalpost } = props;
    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    let sokersIdent: string;

    if (journalpost?.norskIdent) {
        sokersIdent = journalpost?.norskIdent;
    } else {
        return <Alert variant="warning">{intlHelper(intl, 'ident.usignert.feil.melding')}</Alert>;
    }

    return (
        <div className="journalpostAlleredeBehandlet__container">
            <Alert variant="info">{intlHelper(intl, 'fordeling.kanikkesendeinn')}</Alert>
            <VerticalSpacer thirtyTwoPx />
            <div>
                <b>
                    <FormattedMessage id="journalpost.norskIdent" />
                </b>
                {sokersIdent} <Kopier verdi={sokersIdent} />
            </div>
            <VerticalSpacer eightPx />
            {!fellesState.kopierJournalpostSuccess && (
                <Pleietrengende
                    visPleietrengende
                    skalHenteBarn
                    sokersIdent={sokersIdent}
                    toSokereIJournalpost={false}
                />
            )}
            <JournalPostKopiFelmeldinger fellesState={fellesState} intl={intl} />

            <Button
                variant="secondary"
                className="kopier__button"
                size="small"
                disabled={
                    IdentRules.erUgyldigIdent(identState.pleietrengendeId) || fellesState.kopierJournalpostSuccess
                }
                onClick={() => {
                    if (fellesState.kopierJournalpostSuccess || erInntektsmeldingUtenKrav) {
                        setVisKanIkkeKopiere(true);
                        return;
                    }
                    if (!!sokersIdent && !!identState.pleietrengendeId)
                        kopiereJournalpost(
                            sokersIdent,
                            sokersIdent,
                            identState.pleietrengendeId,
                            journalpost?.journalpostId,
                            dedupkey,
                        );
                }}
            >
                <FormattedMessage id="fordeling.kopiereJournal" />
            </Button>
            {!!fellesState.kopierJournalpostSuccess && (
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            )}
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
    kopiereJournalpost: (
        søkerId: string,
        annenIdent: string,
        pleietrengendeId: string,
        journalpostId: string,
        dedupkey: string,
    ) => dispatch(kopierJournalpost(søkerId, annenIdent, pleietrengendeId, journalpostId, dedupkey)),
});

const JournalpostAlleredeBehandlet = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(JournalpostAlleredeBehandletComponent),
);

export { JournalpostAlleredeBehandlet, JournalpostAlleredeBehandletComponent };
