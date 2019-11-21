import {ApiPath}                             from 'app/apiConfig';
import Page                                  from 'app/components/page/Page';
import MapperOgFagsaker                      from 'app/components/pages/punch-page/MapperOgFagsaker';
import PunchForm                             from 'app/components/pages/punch-page/PunchForm';
import {PunchStep}                           from 'app/models/enums';
import {IFagsak, IMappe, IPath, IPunchState} from 'app/models/types';
import {
    backFromForm,
    chooseMappeAction,
    closeFagsakAction,
    closeMappeAction,
    findFagsaker,
    findMapper,
    newMappeAction,
    openFagsakAction,
    openMappeAction,
    setIdentAction,
    undoSearchForMapperAction
}                                            from 'app/state/actions';
import {RootStateType}                       from 'app/state/RootState';
import {apiUrl, changePath, getPath}         from 'app/utils';
import intlHelper                            from 'app/utils/intlUtils';
import {HoyreChevron, VenstreChevron}        from 'nav-frontend-chevron';
import {Flatknapp, Knapp}                    from 'nav-frontend-knapper';
import {Panel}                               from 'nav-frontend-paneler';
import {Input}                               from 'nav-frontend-skjema';
import 'nav-frontend-tabell-style';
import * as React                            from 'react';
import {InjectedIntlProps, injectIntl}       from 'react-intl';
// import {Document, Page as PdfPage} from 'react-pdf';
import {connect}                             from 'react-redux';
import {HashRouter, Route, Switch}           from 'react-router-dom';
import './punchPage.less';

interface IPunchPageStateProps {
    punchState: IPunchState;
}

interface IPunchPageDispatchProps {
    setIdentAction:             typeof setIdentAction;
    findMapper:                 typeof findMapper;
    findFagsaker:               typeof findFagsaker;
    undoSearchForMapperAction:  typeof undoSearchForMapperAction;
    openMappeAction:            typeof openMappeAction;
    closeMappeAction:           typeof closeMappeAction;
    openFagsakAction:           typeof openFagsakAction;
    closeFagsakAction:          typeof closeFagsakAction;
    chooseMappeAction:          typeof chooseMappeAction;
    newMappeAction:             typeof newMappeAction;
    backFromForm:               typeof backFromForm;
}

type IPunchPageProps = InjectedIntlProps & IPunchPageStateProps & IPunchPageDispatchProps;

class PunchPage extends React.Component<IPunchPageProps> {

    private paths: IPath[] = [
        {step: PunchStep.START,         path: '/'},
        {step: PunchStep.CHOOSE_SOKNAD, path: '/hentsoknader/{ident}'},
        {step: PunchStep.FILL_FORM,     path: '/skjema/{id}'}
    ];

    private pdfUrl = apiUrl(ApiPath.DOKUMENT, {journalpost_id: 1, dokument_id: 1});

    render() {
        const {intl, punchState} = this.props;

        return (
            <Page
                title={intlHelper(intl, 'startPage.tittel')}
                className="punch"
            >
                <h1>{intlHelper(intl, 'startPage.tittel')}</h1>
                <div className="panels-wrapper" id="panels-wrapper">
                    <Panel className="punch_pdf" border={true}>
                        <iframe src={this.pdfUrl}/>
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
                </div>
            </Page>
        );
    }

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
        window.open(this.pdfUrl, '_blank', 'toolbar=0,location=0,menubar=0');
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

function mapStateToProps(state: RootStateType) {
    return {
        punchState: state.punchState
    };
}

function mapDispatchToProps(dispatch: any) {return {
    setIdentAction:             (ident: string)         => dispatch(setIdentAction(ident)),
    findMapper:                 (ident: string)         => dispatch(findMapper(ident)),
    findFagsaker:               (ident: string)         => dispatch(findFagsaker(ident)),
    undoSearchForMapperAction:  ()                      => dispatch(undoSearchForMapperAction()),
    openMappeAction:            (mappe: IMappe)         => dispatch(openMappeAction(mappe)),
    closeMappeAction:           ()                      => dispatch(closeMappeAction()),
    openFagsakAction:           (fagsak: IFagsak)       => dispatch(openFagsakAction(fagsak)),
    closeFagsakAction:          ()                      => dispatch(closeFagsakAction()),
    chooseMappeAction:          (mappe: IMappe)         => dispatch(chooseMappeAction(mappe)),
    newMappeAction:             ()                      => dispatch(newMappeAction())
}}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPage));