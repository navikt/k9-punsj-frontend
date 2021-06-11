import React from 'react';
import Page from 'app/components/page/Page';
import {
    IEksisterendeSoknaderComponentProps,
} from 'app/containers/pleiepenger/EksisterendeSoknader';
import 'app/containers/pleiepenger/punchPage.less';
import useQuery from 'app/hooks/useQuery';
import {PunchStep} from 'app/models/enums';
import {IJournalpost, IPath, IPleiepengerPunchState, IPunchFormState} from 'app/models/types';
import {setIdentAction, setStepAction} from 'app/state/actions';
import {RootStateType} from 'app/state/RootState';
import {getPath} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {
    AlertStripeAdvarsel,
    AlertStripeSuksess,
} from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import 'nav-frontend-tabell-style';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import PdfVisning from '../../components/pdf/PdfVisning';
import {peiepengerPaths} from "./PeiepengerRoutes";
import {RegistreringsValg} from "./RegistreringsValg";
import {IIdentState} from "../../models/types/IdentState";
import {JournalpostPanel} from "../../components/journalpost-panel/JournalpostPanel";
import {PSBPunchForm} from './PSBPunchForm';
import SoknadKvittering from "./SoknadKvittering/SoknadKvittering";


export interface IPunchPageStateProps {
    punchState: IPleiepengerPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchFormState;
}

export interface IPunchPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchPageQueryProps {
    dok?: string | null;
}

export interface IPunchPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchPageComponentState {
    ident1: string;
    ident2: string;
    barnetHarIkkeFnr: boolean;
}

type IPunchPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchPageComponentProps &
    IPunchPageStateProps &
    IPunchPageDispatchProps &
    IPunchPageQueryProps;

export class PunchPageComponent extends React.Component<IPunchPageProps,
    IPunchPageComponentState> {
    state: IPunchPageComponentState = {
        ident1: '',
        ident2: '',
        barnetHarIkkeFnr: false,
    };

    componentDidMount(): void {
        this.setState({
            ident1: this.props.punchState.ident1,
            ident2: this.props.punchState.ident2 || '',
            barnetHarIkkeFnr: false,
        });
    }

    componentDidUpdate(
        prevProps: Readonly<IPunchPageProps>,
        prevState: Readonly<IPunchPageComponentState>,
        snapshot?: any
    ): void {
        !this.state.ident1 &&
        this.props.punchState.ident1 &&
        this.setState({ident1: this.props.punchState.ident1});
        !this.state.ident2 &&
        this.props.punchState.ident2 &&
        this.setState({ident2: this.props.punchState.ident2});
    }

    render() {
        const {intl} = this.props;
        return (
            <Page title={intlHelper(intl, 'startPage.tittel')} className="punch">
                {this.content()}
            </Page>
        );
    }

    private content() {
        const {journalpostid, journalpost, forbidden} = this.props;
        const dokumenter = journalpost?.dokumenter || [];

        if (!!forbidden) {
            return <AlertStripeAdvarsel>
                <FormattedMessage id={'søk.jp.forbidden'} values={{jpid: journalpostid}}/>
            </AlertStripeAdvarsel>
        }

        return (
            <div className="panels-wrapper" id="panels-wrapper">
                <Panel className="pleiepenger_punch_form" border={true}>
                    <JournalpostPanel/>
                    {this.underFnr()}
                </Panel>
                {journalpostid &&
                <PdfVisning dokumenter={dokumenter} journalpostId={journalpostid}/>}
            </div>
        );
    }

    private getPath = (step: PunchStep, values?: any) =>
        getPath(
            peiepengerPaths,
            step,
            values,
            this.props.dok ? {dok: this.props.dok} : undefined
        );

    private underFnr() {
        const commonProps = {
            journalpostid: this.props.journalpostid || '',
            getPunchPath: this.getPath,
        };

        switch (this.props.step) {
            case PunchStep.CHOOSE_SOKNAD:
                return <RegistreringsValg {...commonProps} {...this.extractIdents()} />;
            case PunchStep.FILL_FORM:
                return <PSBPunchForm {...commonProps} id={this.props.match.params.id}/>;
            case PunchStep.COMPLETED:
                return (<>
                        <AlertStripeSuksess className="fullfortmelding">
                            Søknaden er sendt til behandling.
                        </AlertStripeSuksess>

                        {typeof this.props.punchFormState.innsentSoknad !== "undefined" &&
                        <SoknadKvittering response={this.props.punchFormState.innsentSoknad}
                                          intl={this.props.intl}/>}
                    </>);
        }
    }

    private extractIdents(): Pick<IEksisterendeSoknaderComponentProps,
        'ident1' | 'ident2'> {
        const ident = this.props.identState.ident1;
        return /^\d+&\d+$/.test(ident)
            ? {ident1: /^\d+/.exec(ident)![0], ident2: /\d+$/.exec(ident)![0]}
            : {ident1: ident, ident2: null};
    }

}

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) =>
        dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchPageComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (
    props: IPunchPageProps
) => {
    const dok = useQuery().get('dok');
    return <PunchPageComponent {...props} dok={dok}/>;
};

export const PunchPage = withRouter(
    injectIntl(
        connect(mapStateToProps, mapDispatchToProps)(PunchPageComponentWithQuery)
    )
);
