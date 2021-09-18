import {IJournalpost} from 'app/models/types';
import {RootStateType} from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeAdvarsel} from 'nav-frontend-alertstriper';
import {Knapp} from 'nav-frontend-knapper';
import React from 'react';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {connect} from 'react-redux';
import {IIdentState} from "../../../../../models/types/IdentState";
import {IFellesState, kopierJournalpost} from "../../../../../state/reducers/FellesReducer";
import JournalPostKopiFelmeldinger from "../JournalPostKopiFelmeldinger";
import {SokersBarn} from "../SokersBarn";
import {skalViseFeilmelding} from "../../FordelingFeilmeldinger";
import './journalpostAlleredeBehandlet.less';

export interface IJournalpostAlleredeBehandletStateProps {
    intl: IntlShape
    journalpost?: IJournalpost;
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IJournalpostAlleredeBehandletDispatchProps {
    kopierJournalpost: typeof kopierJournalpost;
}

type IJournalpostAlleredeBehandletProps =
    IJournalpostAlleredeBehandletStateProps
    & IJournalpostAlleredeBehandletDispatchProps;

const JournalpostAlleredeBehandletComponent: React.FunctionComponent<IJournalpostAlleredeBehandletProps> = (
    props: IJournalpostAlleredeBehandletProps
) => {
    const {
        intl,
        journalpost,
        identState,
    } = props;

    let sokersIdent: string;

    if(!!journalpost && typeof journalpost?.norskIdent !== 'undefined'){
        sokersIdent = journalpost?.norskIdent;
    }else{
        return(<AlertStripeAdvarsel>{intlHelper(intl, 'ident.usignert.feil.melding')}</AlertStripeAdvarsel>)
    }

    return (
        <div className="journalpostAlleredeBehandlet__container">
            <AlertStripeAdvarsel>{intlHelper(intl, 'fordeling.kanikkesendeinn')}</AlertStripeAdvarsel>
            <SokersBarn
                sokersIdent={sokersIdent}
            />
            <JournalPostKopiFelmeldinger
                fellesState={props.fellesState}
                intl={intl}
            />
            <Knapp
                disabled={skalViseFeilmelding(identState.ident2) || !identState.ident2}
                onClick={() => props.kopierJournalpost(sokersIdent, '', sokersIdent, props.dedupkey, journalpost?.journalpostId)}>
                <FormattedMessage id="fordeling.kopiereJournal"/>
            </Knapp>
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    identState: state.identState,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey
});

const mapDispatchToProps = (dispatch: any) => ({
    kopierJournalpost: (ident1: string, ident2: string, annenIdent: string, dedupkey: string, journalpostId: string) =>
        dispatch(kopierJournalpost(ident1, annenIdent, ident2, journalpostId, dedupkey))
});

const JournalpostAlleredeBehandlet = injectIntl(connect(mapStateToProps, mapDispatchToProps)(JournalpostAlleredeBehandletComponent));

export {JournalpostAlleredeBehandlet, JournalpostAlleredeBehandletComponent};
