import SoknadReadMode                                                from 'app/containers/punch-page/SoknadReadMode';
import {PunchStep}                                                   from 'app/models/enums';
import {IFagsak, IMappe, IMapperOgFagsakerState, IPath, IPunchState} from 'app/models/types';
import {
    chooseMappeAction,
    closeFagsakAction,
    closeMappeAction,
    createMappe,
    findFagsaker,
    findMapper,
    openFagsakAction,
    openMappeAction,
    resetMappeidAction,
    setIdentAction,
    setStepAction,
    undoSearchForMapperAction
}                                                                    from 'app/state/actions';
import {RootStateType}                                               from 'app/state/RootState';
import {changePath, getPath}                                         from 'app/utils';
import {AlertStripeFeil, AlertStripeInfo}                            from 'nav-frontend-alertstriper';
import {Knapp}                                                       from 'nav-frontend-knapper';
import ModalWrapper                                                  from 'nav-frontend-modal';
import NavFrontendSpinner                                            from 'nav-frontend-spinner';
import * as React                                                    from 'react';
import {InjectedIntlProps, injectIntl}                               from 'react-intl';
import {connect}                                                     from 'react-redux';
import {useParams}                                                   from 'react-router-dom';

interface IMapperOgFagsakerStateProps {
    punchState: IPunchState;
    mapperOgFagsakerState: IMapperOgFagsakerState;
}

interface IMapperOgFagsakerDispatchProps {
    setIdentAction:             typeof setIdentAction;
    setStepAction:              typeof setStepAction;
    findMapper:                 typeof findMapper;
    findFagsaker:               typeof findFagsaker;
    undoSearchForMapperAction:  typeof undoSearchForMapperAction;
    openMappeAction:            typeof openMappeAction;
    closeMappeAction:           typeof closeMappeAction;
    openFagsakAction:           typeof openFagsakAction;
    closeFagsakAction:          typeof closeFagsakAction;
    chooseMappeAction:          typeof chooseMappeAction;
    createMappe:                typeof createMappe;
    resetMappeidAction:         typeof resetMappeidAction;
}

interface IMapperOgFagsakerComponentProps {
    journalpostid:  string;
    getPunchPath:   (step: PunchStep, values?: any) => string;
}

type IMapperOgFagsakerProps = InjectedIntlProps &
                              IMapperOgFagsakerComponentProps &
                              IMapperOgFagsakerStateProps &
                              IMapperOgFagsakerDispatchProps;

const MapperOgFagsaker: React.FunctionComponent<IMapperOgFagsakerProps> = (props: IMapperOgFagsakerProps) => {

    const {punchState, mapperOgFagsakerState, getPunchPath} = props;
    const {mapper, fagsaker} = mapperOgFagsakerState;
    const {ident} = useParams();

    React.useEffect(() => {
        if (!!ident && ident !== '') {
            props.setIdentAction(ident);
            props.findMapper(ident);
            props.findFagsaker(ident);
            props.setStepAction(PunchStep.CHOOSE_SOKNAD);
        } else {
            changePath(getPunchPath(PunchStep.IDENT));
        }
    }, [ident]);

    if (!!mapperOgFagsakerState.mappeid) {
        props.resetMappeidAction();
        changePath(getPunchPath(PunchStep.FILL_FORM, {id: mapperOgFagsakerState.mappeid}));
        return null;
    }

    if (!ident || ident === '' || !window.location.hash.match(getPunchPath(PunchStep.CHOOSE_SOKNAD, {ident: ''}))) {
        return null;
    }

    const backButton = <p><Knapp onClick={undoSearchForMapperAndFagsaker}>Til startsiden</Knapp></p>;

    if (mapperOgFagsakerState.mapperRequestError || mapperOgFagsakerState.fagsakerRequestError) {
        return <>
            <AlertStripeFeil>Det oppsto en tilkoblingsfeil.</AlertStripeFeil>
            {backButton}
        </>;
    }

    if (punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        mapperOgFagsakerState.isMapperLoading ||
        mapperOgFagsakerState.isFagsakerLoading ||
        mapperOgFagsakerState.isAwaitingMappeCreation) {
        return <div><NavFrontendSpinner/></div>;
    }

    const newMappe = () => props.createMappe(punchState.ident, props.journalpostid);

    if (!mapper.length && !fagsaker.length) {
        newMappe();
        return null;
    }

    const chooseMappe = (mappe: IMappe) => {
        props.chooseMappeAction(mappe);
        changePath(getPunchPath(PunchStep.FILL_FORM, {id: mappe.mappe_id}));
    };

    function showMapper() {

        const modaler = [];
        const rows = [];

        for (const mappe of mapper) {
            const {mappe_id} = mappe;
            const {chosenMappe} = props.mapperOgFagsakerState;
            rows.push(
                <tr key={mappe_id} onClick={() => props.openMappeAction(mappe)}>
                    <td>{mappe_id}</td>
                    <td>Test</td>
                    <td>Test</td>
                    <td>Test</td>
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    key={mappe_id}
                    onRequestClose={props.closeMappeAction}
                    contentLabel={mappe_id}
                    isOpen={!!chosenMappe && mappe_id === chosenMappe.mappe_id}
                >
                    <div className="modal_content">
                        {!!chosenMappe && !!chosenMappe.innhold && <SoknadReadMode soknad={chosenMappe.innhold}/>}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => chooseMappe(mappe)}>Velg denne</Knapp>
                            <Knapp className="knapp2" onClick={props.closeMappeAction}>Lukk</Knapp>
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
                <tbody>{rows}</tbody>
            </table>
            {modaler}
        </>);
    }

    function showFagsaker() {

        const modaler = [];
        const rows = [];

        for (const fagsak of fagsaker) {
            const {fagsak_id} = fagsak;
            const {chosenFagsak} = props.mapperOgFagsakerState;
            rows.push(
                <tr key={fagsak_id} onClick={() => props.openFagsakAction(fagsak)}>
                    <td>{fagsak_id}</td>
                    <td>Test</td>
                    <td>Test</td>
                    <td>Test</td>
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    key={fagsak_id}
                    onRequestClose={props.closeFagsakAction}
                    contentLabel={fagsak_id}
                    isOpen={!!chosenFagsak && fagsak_id === chosenFagsak.fagsak_id}
                >
                    <div className="modal_content">
                        <p>Viser info om fagsak {fagsak_id}.</p>
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1">Velg denne</Knapp>
                            <Knapp className="knapp2" onClick={props.closeFagsakAction}>Lukk</Knapp>
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

    function undoSearchForMapperAndFagsaker() {
        changePath(getPunchPath(PunchStep.IDENT));
        props.undoSearchForMapperAction();
    }

    const newSoknadButton = <p><Knapp onClick={newMappe}>Opprett ny søknad</Knapp></p>;

    if (mapper.length && !fagsaker.length) {
        return (<>
            {backButton}
            <AlertStripeInfo>Det finnes ufullstendige søknader knyttet til identitetsnummeret. Velg søknaden som hører til dokumentet eller opprett en ny.</AlertStripeInfo>
            {showMapper()}
            {newSoknadButton}
        </>);
    }

    if (fagsaker.length && !mapper.length) {
        return (<>
            {backButton}
            <AlertStripeInfo>Det finnes fagsaker knyttet til identitetsnummeret. Velg saken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
            {newSoknadButton}
            {showFagsaker()}
        </>);
    }

    return (<>
        {backButton}
        <AlertStripeInfo>Det finnes ufullstendige søknader og fagsaker knyttet til identitetsnummeret. Velg søknaden eller fagsaken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
        {showMapper()}
        {newSoknadButton}
        {showFagsaker()}
    </>);
};

const mapStateToProps = (state: RootStateType) => ({
    punchState:             state.punchState,
    mapperOgFagsakerState:  state.mapperOgFagsakerState
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction:             (ident: string)         => dispatch(setIdentAction(ident)),
    setStepAction:              (step: PunchStep)       => dispatch(setStepAction(step)),
    findMapper:                 (ident: string)         => dispatch(findMapper(ident)),
    findFagsaker:               (ident: string)         => dispatch(findFagsaker(ident)),
    undoSearchForMapperAction:  ()                      => dispatch(undoSearchForMapperAction()),
    openMappeAction:            (mappe: IMappe)         => dispatch(openMappeAction(mappe)),
    closeMappeAction:           ()                      => dispatch(closeMappeAction()),
    openFagsakAction:           (fagsak: IFagsak)       => dispatch(openFagsakAction(fagsak)),
    closeFagsakAction:          ()                      => dispatch(closeFagsakAction()),
    chooseMappeAction:          (mappe: IMappe)         => dispatch(chooseMappeAction(mappe)),
    createMappe:                (ident: string,
                                 journalpostid: string) => dispatch(createMappe(ident, journalpostid)),
    resetMappeidAction:         ()                      => dispatch(resetMappeidAction())
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MapperOgFagsaker));
