import { IJournalpost } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import Kopier from 'app/components/kopier/Kopier';
import { erUgyldigIdent } from 'app/rules/valideringer';
import { IIdentState } from '../../../../../models/types/IdentState';
import { IFellesState, kopierJournalpost } from '../../../../../state/reducers/FellesReducer';
import JournalPostKopiFelmeldinger from '../JournalPostKopiFelmeldinger';
import { Pleietrengende } from '../Pleietrengende';
import './journalpostAlleredeBehandlet.less';
import { getEnvironmentVariable } from '../../../../../utils';
import VerticalSpacer from '../../../../../components/VerticalSpacer';
import PunsjInnsendingType from '../../../../../models/enums/PunsjInnsendingType';

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
    props: IJournalpostAlleredeBehandletProps
) => {
    const { intl, journalpost, identState, fellesState, dedupkey, kopiereJournalpost } = props;
    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    let sokersIdent: string;

    if (journalpost?.norskIdent) {
        sokersIdent = journalpost?.norskIdent;
    } else {
        return <AlertStripeAdvarsel>{intlHelper(intl, 'ident.usignert.feil.melding')}</AlertStripeAdvarsel>;
    }

    return (
        <div className="journalpostAlleredeBehandlet__container">
            <AlertStripeAdvarsel>{intlHelper(intl, 'fordeling.kanikkesendeinn')}</AlertStripeAdvarsel>
            <div>
                <b>
                    <FormattedMessage id="journalpost.norskIdent" />
                </b>{' '}
                {sokersIdent} <Kopier verdi={sokersIdent} />
            </div>
            <VerticalSpacer eightPx />
            {!fellesState.kopierJournalpostSuccess && <Pleietrengende visPleietrengende skalHenteBarn sokersIdent={sokersIdent} />}
            <JournalPostKopiFelmeldinger fellesState={fellesState} intl={intl} />
            {!fellesState.kopierJournalpostSuccess && !erInntektsmeldingUtenKrav && (
                <Knapp
                    disabled={erUgyldigIdent(identState.ident2)}
                    onClick={() => {
                        if (!!sokersIdent && !!identState.ident2)
                            kopiereJournalpost(
                                sokersIdent,
                                identState.ident2,
                                sokersIdent,
                                dedupkey,
                                journalpost?.journalpostId
                            );
                    }}
                >
                    <FormattedMessage id="fordeling.kopiereJournal" />
                </Knapp>
            )}
            {!!fellesState.kopierJournalpostSuccess && (
                <Hovedknapp
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Hovedknapp>
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
    kopiereJournalpost: (ident1: string, ident2: string, annenIdent: string, dedupkey: string, journalpostId: string) =>
        dispatch(kopierJournalpost(ident1, annenIdent, ident2, journalpostId, dedupkey)),
});

const JournalpostAlleredeBehandlet = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(JournalpostAlleredeBehandletComponent)
);

export { JournalpostAlleredeBehandlet, JournalpostAlleredeBehandletComponent };
