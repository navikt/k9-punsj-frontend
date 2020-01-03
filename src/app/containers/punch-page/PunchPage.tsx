import {ApiPath}                                       from 'app/apiConfig';
import Page                                            from 'app/components/page/Page';
import {Fordeling}                                     from 'app/containers/punch-page/Fordeling';
import {MapperOgFagsaker}                              from 'app/containers/punch-page/MapperOgFagsaker';
import {PunchForm}                                     from 'app/containers/punch-page/PunchForm';
import 'app/containers/punch-page/punchPage.less';
import {PunchStep}                                     from 'app/models/enums';
import {IPath, IPunchState}                            from 'app/models/types';
import {getJournalpost, setIdentAction, setStepAction} from 'app/state/actions';
import {RootStateType}                                 from 'app/state/RootState';
import {apiUrl, changePath, getPath}                   from 'app/utils';
import intlHelper                                      from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}           from 'nav-frontend-alertstriper';
import {HoyreChevron, VenstreChevron}                  from 'nav-frontend-chevron';
import {Flatknapp, Knapp}                              from 'nav-frontend-knapper';
import {Panel}                                         from 'nav-frontend-paneler';
import {Input}                                         from 'nav-frontend-skjema';
import NavFrontendSpinner                              from 'nav-frontend-spinner';
import 'nav-frontend-tabell-style';
import {Resizable}                                     from 're-resizable';
import * as React                                      from 'react';
import {Col, Container, Row}                           from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}             from 'react-intl';
import {connect}                                       from 'react-redux';
import {RouteComponentProps, withRouter}               from 'react-router';

export interface IPunchPageStateProps {
    punchState: IPunchState;
}

export interface IPunchPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction:  typeof setStepAction;
    getJournalpost: typeof getJournalpost;
}

export interface IPunchPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid: string;
    paths: IPath[];
}

type IPunchPageProps = WrappedComponentProps &
                       RouteComponentProps &
                       IPunchPageComponentProps &
                       IPunchPageStateProps &
                       IPunchPageDispatchProps;

export class PunchPageComponent extends React.Component<IPunchPageProps> {

    componentDidMount(): void {
        this.props.getJournalpost(this.props.journalpostid);
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

        if (punchState.isJournalpostLoading) {
            return <Container style={{height: '100%'}}>
                <Row className="justify-content-center align-items-center" style={{height: '100%'}}>
                    <Col xs={'auto'}><NavFrontendSpinner/></Col>
                </Row>
            </Container>;
        }

        if (!!punchState.journalpostRequestError) {
            return <AlertStripeFeil>Det skjedde en feil i uthenting av journalpost.</AlertStripeFeil>;
        }

        if (!punchState.journalpost) {
            return null;
        }

        if (!punchState.journalpost.dokumenter.length) {
            return <AlertStripeFeil>Journalposten har ingen tilhørende dokumenter.</AlertStripeFeil>;
        }

        return <div className="panels-wrapper" id="panels-wrapper">
                <Panel className="punch_form" border={true}>
                    <div>
                        {punchState.step > PunchStep.FORDELING && <Input
                            label={intlHelper(intl, 'skjema.ident')}
                            onChange={this.handleIdentBlur}
                            onKeyPress={this.handleIdentKeyPress}
                            value={punchState.ident}
                            disabled={punchState.step > PunchStep.IDENT}
                            className="bold-label"
                        />}
                    </div>
                    {this.underFnr()}
                </Panel>
            <Resizable
                className="punch_pdf_wrapper"
                enable={{top: false, right: false, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false}}
                defaultSize={{width: '50%', height: '100%'}}
                minWidth={400}
            >
            <Panel className="punch_pdf">
                <iframe src={this.pdfUrl()}/>
                <div className="knapperad">
                    <Flatknapp onClick={this.togglePdf} className="knapp1">Skjul <HoyreChevron/></Flatknapp>
                    <Flatknapp onClick={this.openPdfWindow} className="knapp2">Åpne i nytt vindu</Flatknapp>
                </div>
                <Flatknapp
                    onClick={this.togglePdf}
                    className="button_open"
                ><VenstreChevron/></Flatknapp>
            </Panel>
                              </Resizable>
        </div>;
    }

    private pdfUrl = () =>  apiUrl(ApiPath.DOKUMENT, {
        journalpost_id: this.props.journalpostid,
        dokument_id:    this.props.punchState.journalpost!.dokumenter[0].dokument_id
    });

    private getPath = (step: PunchStep, values?: any) => getPath(this.props.paths, step, values);

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

    private underFnr() {
        const commonProps = {journalpostid: this.props.journalpostid, getPunchPath: this.getPath};
        switch (this.props.step) {
            case PunchStep.FORDELING:       return <Fordeling getPunchPath={this.getPath}/>;
            case PunchStep.IDENT:           return <IdentPage findSoknader={this.findSoknader}
                                                              setStepAction={this.props.setStepAction}
                                                              getPunchPath={this.getPath}/>;
            case PunchStep.CHOOSE_SOKNAD:   return <MapperOgFagsaker {...commonProps}/>;
            case PunchStep.FILL_FORM:       return <PunchForm {...commonProps} id={this.props.match.params.id}/>;
            case PunchStep.COMPLETED:       return <AlertStripeSuksess>Søknaden er sendt til behandling.</AlertStripeSuksess>;
        }
    }

    private findSoknader = () => {
        changePath(this.getPath(PunchStep.CHOOSE_SOKNAD, {ident: this.props.punchState.ident}));
    };

    private handleIdentBlur = (event: any) => this.props.setIdentAction(event.target.value);

    private handleIdentKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            this.handleIdentBlur(event);
            changePath(this.getPath(PunchStep.CHOOSE_SOKNAD, {ident: event.target.value}));
        }
    };
}

const mapStateToProps = (state: RootStateType) => ({punchState: state.punchState});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident: string) => dispatch(setIdentAction(ident)),
    setStepAction:  (step: number)  => dispatch(setStepAction(step)),
    getJournalpost: (id: string)    => dispatch(getJournalpost(id))
});

interface IIdentPageProps {
    findSoknader:   ()                  => void;
    setStepAction:  (step: number)      => void;
    getPunchPath:   (step: PunchStep)   => string;
}

const IdentPage: React.FunctionComponent<IIdentPageProps> = (props: IIdentPageProps) => {
    React.useEffect(() => {props.setStepAction(PunchStep.IDENT)}, []);
    return <div className="knapperad">
        <Knapp onClick={props.findSoknader} className="knapp knapp1">Åpne skjema</Knapp>
        <Knapp onClick={() => changePath(props.getPunchPath(PunchStep.FORDELING))} className="knapp knapp2">Tilbake</Knapp>
    </div>;
};

export const PunchPage = withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPageComponent)));