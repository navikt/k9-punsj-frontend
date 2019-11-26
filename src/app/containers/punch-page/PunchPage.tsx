import {ApiPath}                                                    from 'app/apiConfig';
import Page                                                         from 'app/components/page/Page';
import MapperOgFagsaker                                             from 'app/containers/punch-page/MapperOgFagsaker';
import PunchForm                                                    from 'app/containers/punch-page/PunchForm';
import 'app/containers/punch-page/punchPage.less';
import {PunchStep}                                                  from 'app/models/enums';
import {IFagsak, IMappe, IPath, IPunchState}                        from 'app/models/types';
import {
    chooseMappeAction,
    closeFagsakAction,
    closeMappeAction,
    findFagsaker,
    findMapper,
    getJournalpost,
    openFagsakAction,
    openMappeAction,
    setIdentAction,
    undoSearchForMapperAction
}                                                                   from 'app/state/actions';
import {RootStateType}                                              from 'app/state/RootState';
import {apiUrl, changePath, getPath}                                from 'app/utils';
import intlHelper                                                   from 'app/utils/intlUtils';
import {AlertStripeFeil}                                            from 'nav-frontend-alertstriper';
import {HoyreChevron, VenstreChevron}                               from 'nav-frontend-chevron';
import {Flatknapp, Knapp}                                           from 'nav-frontend-knapper';
import {Panel}                                                      from 'nav-frontend-paneler';
import {Input}                                                      from 'nav-frontend-skjema';
import NavFrontendSpinner                                           from 'nav-frontend-spinner';
import 'nav-frontend-tabell-style';
import * as React                                                   from 'react';
import {Col, Container, Row}                                        from 'react-bootstrap';
import {InjectedIntlProps, injectIntl}                              from 'react-intl';
// import {Document, Page as PdfPage} from 'react-pdf';
import {connect}                                                    from 'react-redux';
import {HashRouter, Route, RouteComponentProps, Switch, withRouter} from 'react-router-dom';

interface IPunchPageStateProps {
    punchState: IPunchState;
}

interface IPunchPageDispatchProps {
    setIdentAction:             typeof setIdentAction;
    getJournalpost:             typeof getJournalpost;
    findMapper:                 typeof findMapper;
    findFagsaker:               typeof findFagsaker;
    undoSearchForMapperAction:  typeof undoSearchForMapperAction;
    openMappeAction:            typeof openMappeAction;
    closeMappeAction:           typeof closeMappeAction;
    openFagsakAction:           typeof openFagsakAction;
    closeFagsakAction:          typeof closeFagsakAction;
    chooseMappeAction:          typeof chooseMappeAction;
}

interface IPunchPageComponentProps {
    match?: any;
}

type IPunchPageProps = InjectedIntlProps &
                       RouteComponentProps &
                       IPunchPageComponentProps &
                       IPunchPageStateProps &
                       IPunchPageDispatchProps;

class PunchPage extends React.Component<IPunchPageProps> {

    private paths: IPath[] = [
        {step: PunchStep.START,         path: '/'},
        {step: PunchStep.CHOOSE_SOKNAD, path: '/hentsoknader/{ident}'},
        {step: PunchStep.FILL_FORM,     path: '/skjema/{id}'}
    ];

    componentDidMount(): void {
        this.props.getJournalpost(this.props.match.params.journalpostid);
    }

    render() {
        console.log('render punchpage');
        const {intl} = this.props;
        return (
            <Page
                title={intlHelper(intl, 'startPage.tittel')}
                className="punch"
            >
                <h1>{intlHelper(intl, 'startPage.tittel')}</h1>
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
            <Panel className="punch_pdf" border={true}>
                <iframe src={this.pdfUrl()}/>
                {/*<Document file="http://localhost:8080/api/journalpost/1/dokument/1">
                            <PdfPage pageNumber={1}/>
                        </Document>*/}
                <div className="knapperad">
                    <Flatknapp onClick={this.openPdfWindow} className="knapp1">Åpne i nytt vindu</Flatknapp>
                    <Flatknapp onClick={this.togglePdf} className="knapp2"><VenstreChevron/> Skjul</Flatknapp>
                </div>
                <Flatknapp
                    onClick={this.togglePdf}
                    className="button_open"
                ><HoyreChevron/></Flatknapp>
            </Panel>
            <Panel className="punch_form" border={true}>
                <div>
                    <Input
                        label={`${intlHelper(intl, 'skjema.fodselsnr')}:`}
                        onChange={this.handleIdentBlur}
                        onKeyPress={this.handleIdentKeyPress}
                        value={punchState.ident}
                        disabled={punchState.step > PunchStep.START}
                        feil={!!punchState.mapperRequestError ? {feilmelding: 'Det skjedde en feil i søket. Er nummeret riktig?'} : undefined}
                    />
                </div>
                {this.underFnr()}
            </Panel>
        </div>;
    }

    private pdfUrl = () =>  apiUrl(ApiPath.DOKUMENT, {
        journalpost_id: this.props.match.params.journalpostid,
        dokument_id: this.props.punchState.journalpost!.dokumenter[0].dokument_id
    });

    private getPath(step: PunchStep, values?: any) {
        return getPath(this.paths, step, values);
    }

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

        return (
            <HashRouter>
                <Switch>
                    <Route
                        path={this.getPath(PunchStep.FILL_FORM)}
                        children={<PunchForm punchPaths={this.paths}/>}
                    />
                    <Route
                        path={this.getPath(PunchStep.CHOOSE_SOKNAD)}
                        children={<MapperOgFagsaker punchPaths={this.paths}/>}
                    />
                    <Route path={this.getPath(PunchStep.START)}>
                        <p><Knapp onClick={this.findSoknader}>Hent søknader</Knapp></p>
                    </Route>
                </Switch>
            </HashRouter>
        );
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
    setIdentAction:             (ident: string)         => dispatch(setIdentAction(ident)),
    getJournalpost:             (id: string)            => dispatch(getJournalpost(id)),
    findMapper:                 (ident: string)         => dispatch(findMapper(ident)),
    findFagsaker:               (ident: string)         => dispatch(findFagsaker(ident)),
    undoSearchForMapperAction:  ()                      => dispatch(undoSearchForMapperAction()),
    openMappeAction:            (mappe: IMappe)         => dispatch(openMappeAction(mappe)),
    closeMappeAction:           ()                      => dispatch(closeMappeAction()),
    openFagsakAction:           (fagsak: IFagsak)       => dispatch(openFagsakAction(fagsak)),
    closeFagsakAction:          ()                      => dispatch(closeFagsakAction()),
    chooseMappeAction:          (mappe: IMappe)         => dispatch(chooseMappeAction(mappe))
});

export default withRouter(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPage)));