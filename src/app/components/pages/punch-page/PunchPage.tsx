import _ from "lodash";
import * as React from 'react';
import {InjectedIntlProps, injectIntl} from 'react-intl';
// import {Document, Page as PdfPage} from 'react-pdf';
import {connect} from 'react-redux';

import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {HoyreChevron, VenstreChevron} from "nav-frontend-chevron";
import {Flatknapp, Knapp} from "nav-frontend-knapper";
import ModalWrapper from "nav-frontend-modal";
import {Panel} from 'nav-frontend-paneler';
import {Input} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import 'nav-frontend-tabell-style';

import {ApiPath} from "app/apiConfig";
import Page from 'app/components/page/Page';
import {PunchStep} from "app/models/enums";
import {IFagsak, IMappe, IPunchState} from 'app/models/types';
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
    setMapperAction,
    undoSearchForMapperAction
} from 'app/state/actions';
import {RootStateType} from 'app/state/RootState';
import {apiUrl} from "app/utils";
import intlHelper from 'app/utils/intlUtils';
import PunchForm from "./PunchForm";
import './punchPage.less';
import SoknadReadMode from "./SoknadReadMode";

interface IPunchPageStateProps {
    punchState: IPunchState;
}

interface IPunchPageDispatchProps {
    setIdentAction:             typeof setIdentAction;
    setMapperAction:            typeof setMapperAction;
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

    render() {
        const {intl, punchState} = this.props;

        if (punchState.step === PunchStep.CHOOSE_SOKNAD && !punchState.isMapperLoading && !punchState.isFagsakerLoading && !punchState.mapper.length && !punchState.fagsaker.length) {
            this.props.newMappeAction();
        }

        return (
            <Page
                title={intlHelper(intl, 'startPage.tittel')}
                className="punch"
            >
                <h1>{intlHelper(intl, 'startPage.tittel')}</h1>
                <div className="panels-wrapper" id="panels-wrapper">
                    <Panel className="punch_pdf" border={true}>
                        <iframe src={apiUrl(ApiPath.DOKUMENT, {journalpost_id: 1, dokument_id: 1})}/>
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
                                onBlur={this.handleIdentBlur}
                                onKeyPress={this.handleIdentKeyPress}
                                disabled={punchState.step > PunchStep.START}
                                feil={!!punchState.mapperRequestError ? {feilmelding: "Det skjedde en feil i søket. Er nummeret riktig?"} : undefined}
                            />
                        </div>
                        {this.underFnr()}
                    </Panel>
                </div>
            </Page>
        );
    }

    private togglePdf = () => {
        const panelsWrapper = document.getElementById('panels-wrapper');
        if (!!panelsWrapper) {
            panelsWrapper.classList.toggle('pdf_closed');
        }
    };

    private openPdfWindow = () => {
        window.open(
            "http://localhost:8080/api/journalpost/1/dokument/1",
            '_blank',
            'toolbar=0,location=0,menubar=0'
        );
        this.togglePdf();
    };

    private underFnr() {
        const {punchState} = this.props;
        switch (punchState.step) {

            case PunchStep.START: return (<>
                <p><Knapp onClick={this.findSoknader}>Hent søknader</Knapp></p>
            </>);

            case PunchStep.CHOOSE_SOKNAD: return (<>
                <p><Knapp onClick={this.props.undoSearchForMapperAction}>Gå tilbake</Knapp></p>
                {this.mapperOgFagsaker()}
            </>);

            case PunchStep.FILL_FORM: return (<>
                <p><Knapp onClick={() => this.props.backFromForm(punchState.chosenMappe)}>Gå tilbake</Knapp></p>
                <PunchForm soknad={_.get(punchState.chosenMappe, 'innhold')}/>
            </>);
        }
    }

    private mapperOgFagsaker() {

        const {punchState} = this.props;
        const {mapper, fagsaker} = punchState;

        if (punchState.isMapperLoading || punchState.isFagsakerLoading) {
            return <div><NavFrontendSpinner/></div>;
        }

        if (mapper.length && !fagsaker.length) {
            return (<>
                <AlertStripeInfo>Det finnes ufullstendige søknader knyttet til identitetsnummeret. Velg søknaden som hører til dokumentet eller opprett en ny.</AlertStripeInfo>
                {this.mapper()}
                <p><Knapp onClick={this.newMappe}>Opprett ny søknad</Knapp></p>
            </>);
        }

        if (fagsaker.length && !mapper.length) {
            return (<>
                <AlertStripeInfo>Det finnes fagsaker knyttet til identitetsnummeret. Velg saken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
                <p><Knapp onClick={this.newMappe}>Opprett ny søknad</Knapp></p>
                {this.fagsaker()}
            </>);
        }

        return (<>
            <AlertStripeInfo>Det finnes ufullstendige søknader og fagsaker knyttet til identitetsnummeret. Velg søknaden eller fagsaken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
            {this.mapper()}
            <p><Knapp onClick={this.newMappe}>Opprett ny søknad</Knapp></p>
            {this.fagsaker()}
        </>);
    }

    private mapper() {

        const {mapper} = this.props.punchState;

        const modaler = [];
        const rows = [];

        for (const mappe of mapper) {
            const {mappe_id} = mappe;
            const {chosenMappe} = this.props.punchState;
            rows.push(
                <tr key={mappe_id} onClick={() => this.openMappe(mappe)}>
                    <td>{mappe_id}</td>
                    <td>Test</td>
                    <td>Test</td>
                    <td>Test</td>
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    onRequestClose={this.closeMappe}
                    contentLabel={mappe_id}
                    isOpen={!!chosenMappe && mappe_id === chosenMappe.mappe_id}
                >
                    <div className="modal_content">
                        {!!chosenMappe && !!chosenMappe.innhold && <SoknadReadMode soknad={chosenMappe.innhold}/>}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => this.chooseMappe(mappe)}>Velg denne</Knapp>
                            <Knapp className="knapp2" onClick={this.closeMappe}>Lukk</Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            )
        }

        return (<>
            <h2>Ufullstendige søknader</h2>
            <table className="tabell tabell--stripet punch_mappetabell">
                <thead>
                    <tr>
                        <th>Mappe-ID</th>
                        <th>Ident</th>
                        <th>Navn</th>
                        <th>Periode</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            {modaler}
        </>);
    }

    private fagsaker() {

        const {fagsaker} = this.props.punchState;

        const modaler = [];
        const rows = [];

        for (const fagsak of fagsaker) {
            const {fagsak_id} = fagsak;
            const {chosenFagsak} = this.props.punchState;
            rows.push(
                <tr key={fagsak_id} onClick={() => this.props.openFagsakAction(fagsak)}>
                    <td>{fagsak_id}</td>
                    <td>Test</td>
                    <td>Test</td>
                    <td>Test</td>
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    onRequestClose={this.props.closeFagsakAction}
                    contentLabel={fagsak_id}
                    isOpen={!!chosenFagsak && fagsak_id === chosenFagsak.fagsak_id}
                >
                    <div className="modal_content">
                        <p>Viser info om fagsak {fagsak_id}.</p>
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1">Velg denne</Knapp>
                            <Knapp className="knapp2" onClick={this.props.closeFagsakAction}>Lukk</Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            )
        }

        return (<>
            <h2>Fagsaker</h2>
            <table className="tabell tabell--stripet punch_mappetabell">
                <thead>
                <tr>
                    <th>Fagsak-ID</th>
                    <th>Ident</th>
                    <th>Navn</th>
                    <th>Periode</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
            {modaler}
        </>);
    }

    private findSoknader = () => {
        this.props.findMapper(this.props.punchState.ident);
        this.props.findFagsaker(this.props.punchState.ident);
    };

    private handleIdentBlur = (event: any) => this.props.setIdentAction(event.target.value);

    private handleIdentKeyPress = (event: any) => {
        if (event.key === "Enter") {
            this.handleIdentBlur(event);
            this.props.findMapper(event.target.value);
            this.props.findFagsaker(event.target.value);
        }
    };

    private openMappe = (mappe: IMappe) => this.props.openMappeAction(mappe);
    private closeMappe = () => this.props.closeMappeAction();
    private chooseMappe = (mappe: IMappe) => this.props.chooseMappeAction(mappe);
    private newMappe = () => this.props.newMappeAction();
}

function mapStateToProps(state: RootStateType) {return {
    punchState: state.punchState
}}

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
    newMappeAction:             ()                      => dispatch(newMappeAction()),
    backFromForm:               (chosenMappe?: IMappe)  => dispatch(backFromForm(chosenMappe))
}}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPage));