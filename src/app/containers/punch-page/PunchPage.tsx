import {ApiPath}                                           from 'app/apiConfig';
import Page                                                from 'app/components/page/Page';
import {Fordeling}                                         from 'app/containers/punch-page/Fordeling';
import {Ident}                                             from 'app/containers/punch-page/Ident';
import {IMapperOgFagsakerComponentProps, MapperOgFagsaker} from 'app/containers/punch-page/MapperOgFagsaker';
import {PunchForm}                                         from 'app/containers/punch-page/PunchForm';
import 'app/containers/punch-page/punchPage.less';
import useQuery                                            from 'app/hooks/useQuery';
import {PunchStep}                                         from 'app/models/enums';
import {IPath, IPunchState}                                from 'app/models/types';
import {IdentRules}                                        from 'app/rules';
import {getJournalpost, setIdentAction, setStepAction}     from 'app/state/actions';
import {RootStateType}                                     from 'app/state/RootState';
import {apiUrl, getPath, setHash, setQueryInHash}          from 'app/utils';
import intlHelper                                          from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}               from 'nav-frontend-alertstriper';
import {HoyreChevron, VenstreChevron}                      from 'nav-frontend-chevron';
import {Flatknapp}                                         from 'nav-frontend-knapper';
import {Panel}                                             from 'nav-frontend-paneler';
import {Input}                                             from 'nav-frontend-skjema';
import NavFrontendSpinner                                  from 'nav-frontend-spinner';
import 'nav-frontend-tabell-style';
import {Resizable}                                         from 're-resizable';
import * as React                                          from 'react';
import {Col, Container, Row}                               from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                 from 'react-intl';
import {connect}                                           from 'react-redux';
import {RouteComponentProps, withRouter}                   from 'react-router';

export interface IPunchPageStateProps {
    punchState: IPunchState;
}

export interface IPunchPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction:  typeof setStepAction;
    getJournalpost: typeof getJournalpost;
}

export interface IPunchPageQueryProps {
    dok?: string | null;
}

export interface IPunchPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid: string;
    paths: IPath[];
}

export interface IPunchPageComponentState {
    ident1: string;
    ident2: string;
}

type IPunchPageProps = WrappedComponentProps &
                       RouteComponentProps &
                       IPunchPageComponentProps &
                       IPunchPageStateProps &
                       IPunchPageDispatchProps &
                       IPunchPageQueryProps;

export class PunchPageComponent extends React.Component<IPunchPageProps, IPunchPageComponentState> {

    private static goToDok(nr: number) {
        setQueryInHash({dok: nr.toString()});
    }

    state: IPunchPageComponentState = {
        ident1: '',
        ident2: ''
    };

    componentDidMount(): void {
        this.props.getJournalpost(this.props.journalpostid);
        this.setState({ident1: this.props.punchState.ident1, ident2: this.props.punchState.ident2 || ''});
    }

    componentDidUpdate(prevProps: Readonly<IPunchPageProps>, prevState: Readonly<IPunchPageComponentState>, snapshot?: any): void {
        !this.state.ident1 && this.props.punchState.ident1 && this.setState({ident1: this.props.punchState.ident1});
        !this.state.ident2 && this.props.punchState.ident2 && this.setState({ident2: this.props.punchState.ident2});
    }

    render() {
        const {intl} = this.props;
        return (
            <Page
                title={intlHelper(intl, 'startPage.tittel')}
                className="punch"
            >
                {this.content()}
            </Page>
        );
    }

    private content() {

        const {intl, punchState} = this.props;
        const dokumenter = this.props.punchState.journalpost?.dokumenter || [];

        if (punchState.isJournalpostLoading) {
            return <Container style={{height: '100%'}}>
                <Row className="justify-content-center align-items-center" style={{height: '100%'}}>
                    <Col xs={'auto'}><NavFrontendSpinner/></Col>
                </Row>
            </Container>;
        }

        if (!!punchState.journalpostRequestError) {
            return <AlertStripeFeil>{intlHelper(intl, 'startPage.feil.journalpost')}</AlertStripeFeil>;
        }

        if (!punchState.journalpost) {
            return null;
        }

        if (!punchState.journalpost.dokumenter.length) {
            return <AlertStripeFeil>{intlHelper(intl, 'startPage.feil.ingendokumenter')}</AlertStripeFeil>;
        }

        return <div className="panels-wrapper" id="panels-wrapper">
            <Panel className="punch_form" border={true}>
                {punchState.step !== PunchStep.IDENT && this.identInput(this.state)(punchState.step > PunchStep.IDENT)}
                {this.underFnr()}
            </Panel>
            <Resizable
                className="punch_pdf_wrapper"
                enable={{top: false, right: false, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false}}
                defaultSize={{width: '50%', height: '100%'}}
                minWidth={400}
            >
                <Panel className="punch_pdf">
                    {dokumenter.length > 1 && <div className="fleredokumenter">
                        <div><p>{intlHelper(intl, 'dokument.flere', {doknr: this.dokumentnr().toString(), totalnr: dokumenter.length.toString()})}</p></div>
                        {dokumenter.map((d,i) => <Flatknapp
                            key={i}
                            onClick={() => PunchPageComponent.goToDok(i + 1)}
                            className={this.dokumentnr() === i + 1 ? 'aktiv' : undefined}
                        >{i+1}</Flatknapp>)}
                    </div>}
                    <iframe src={this.pdfUrl()}/>
                    <div className="knapperad">
                        <Flatknapp onClick={this.togglePdf} className="knapp1">{intlHelper(intl, 'dokument.skjul')} <HoyreChevron/></Flatknapp>
                        <Flatknapp onClick={this.openPdfWindow} className="knapp2">{intlHelper(intl, 'dokument.nyttvindu')}</Flatknapp>
                    </div>
                    <Flatknapp
                        onClick={this.togglePdf}
                        className="button_open"
                    ><VenstreChevron/></Flatknapp>
                </Panel>
            </Resizable>
        </div>;
    }

    private dokumentnr = () => {
        let doknr: number;
        doknr = !!this.props.dok && /^\d+$/.test(this.props.dok) ? Number(this.props.dok) : 1;
        if (doknr < 1 || doknr > this.props.punchState.journalpost!.dokumenter.length) {
            doknr = 1;
        }
        return doknr;
    };

    private dokumentid = () => {
        const dokIndex = this.dokumentnr() - 1;
        return this.props.punchState.journalpost!.dokumenter[dokIndex].dokumentId;
    };

    private pdfUrl = () =>  apiUrl(ApiPath.DOKUMENT, {
        journalpostId: this.props.journalpostid,
        dokumentId:    this.dokumentid()
    });

    private getPath = (step: PunchStep, values?: any) => getPath(this.props.paths,step, values, this.props.dok ? {dok: this.props.dok} : undefined);

    private togglePdf = () => {
        const panelsWrapper = document.getElementById('panels-wrapper');
        if (!!panelsWrapper) {
            panelsWrapper.classList.toggle('pdf_closed');
        }
    };

    private openPdfWindow = () => {
        window.open(this.pdfUrl(), '_blank', 'toolbar=0,location=0,menubar=0');
        this.togglePdf();
    };

    private identInput = (state: IPunchPageComponentState) => (disabled: boolean) => {
        const {punchState, intl} = this.props;
        const skalViseToFelter = punchState.step === PunchStep.IDENT || punchState.ident2;
        const skalViseFeilmelding = (ident: string | null) =>  ident && ident.length && !disabled && !IdentRules.isIdentValid(ident);
        return punchState.step > PunchStep.FORDELING ? <div>
            <Input
                label={intlHelper(intl, skalViseToFelter ? 'ident.identifikasjon.felt1' : 'ident.identifikasjon.felt')}
                onChange={this.handleIdent1Change}
                onBlur={this.handleIdent1Blur}
                onKeyPress={this.handleIdentKeyPress(1)}
                value={state.ident1}
                {...{disabled}}
                className="bold-label ident-soker-1"
                maxLength={11}
                feil={skalViseFeilmelding(punchState.ident1) ? {feilmelding: intlHelper(intl, 'ident.feil.ugyldigident')} : undefined}
            />
            {skalViseToFelter && <Input
                label={intlHelper(intl, 'ident.identifikasjon.felt2')}
                onChange={this.handleIdent2Change}
                onBlur={this.handleIdent2Blur}
                onKeyPress={this.handleIdentKeyPress(2)}
                value={state.ident2}
                {...{disabled}}
                className="bold-label ident-soker-2"
                maxLength={11}
                feil={skalViseFeilmelding(punchState.ident2) ? {feilmelding: intlHelper(intl, 'ident.feil.ugyldigident')} : undefined}
            />}
        </div> : <></>;
    };

    private underFnr() {
        const commonProps = {journalpostid: this.props.journalpostid, getPunchPath: this.getPath};
        switch (this.props.step) {
            case PunchStep.FORDELING:       return <Fordeling getPunchPath={this.getPath}/>;
            case PunchStep.IDENT:           return <Ident identInput={this.identInput(this.state)}
                                                          identInputValues={this.state}
                                                          findSoknader={this.findSoknader}
                                                          getPunchPath={this.getPath}/>;
            case PunchStep.CHOOSE_SOKNAD:   return <MapperOgFagsaker {...commonProps} {...this.extractIdents()}/>;
            case PunchStep.FILL_FORM:       return <PunchForm {...commonProps} id={this.props.match.params.id}/>;
            case PunchStep.COMPLETED:       return <AlertStripeSuksess>Søknaden er sendt til behandling.</AlertStripeSuksess>;
        }
    }

    private extractIdents(): Pick<IMapperOgFagsakerComponentProps, 'ident1' | 'ident2'> {
        const {ident} = this.props.match.params;
        return (/^\d+&\d+$/.test(ident))
            ? {ident1: /^\d+/.exec(ident)![0], ident2: /\d+$/.exec(ident)![0]}
            : {ident1: ident, ident2: null};
    }

    private redirectToNextStep(ident1: string, ident2: string | null) {
        if (IdentRules.areIdentsValid(ident1, ident2)) {
            const ident = ident1 && ident2 ? `${ident1}&${ident2}` : ident1;
            setHash(this.getPath(PunchStep.CHOOSE_SOKNAD, {ident}));
        }
    }

    private findSoknader = () => {
        this.redirectToNextStep(this.props.punchState.ident1, this.props.punchState.ident2);
    };

    private handleIdent1Change = (event: any) => this.setState({ident1: event.target.value.replace(/\D+/, '')});
    private handleIdent2Change = (event: any) => this.setState({ident2: event.target.value.replace(/\D+/, '')});

    private handleIdent1Blur = (event: any) => this.props.setIdentAction(event.target.value, this.props.punchState.ident2);
    private handleIdent2Blur = (event: any) => this.props.setIdentAction(this.props.punchState.ident1, event.target.value);

    private handleIdentKeyPress(sokernr: 1 | 2) {return (event: any) => {
        if (event.key === 'Enter') {
            let {ident1, ident2} = this.props.punchState;
            if (sokernr === 1) {
                this.handleIdent1Blur(event);
                ident1 = event.target.value;
            } else {
                this.handleIdent2Blur(event);
                ident2 = event.target.value;
            }
            this.redirectToNextStep(ident1, ident2);
        }
    }}
}

const mapStateToProps = (state: RootStateType) => ({punchState: state.punchState});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string,
                     ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction:  (step: number)          => dispatch(setStepAction(step)),
    getJournalpost: (id: string)            => dispatch(getJournalpost(id))
});

const PunchPageComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (props: IPunchPageProps) => {
    const dok = useQuery().get('dok');
    return <PunchPageComponent {...props} dok={dok}/>;
};

export const PunchPage = withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPageComponentWithQuery)));