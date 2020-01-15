import FagsakReadMode                                                       from 'app/containers/punch-page/FagsakReadMode';
import SoknadReadMode                                                       from 'app/containers/punch-page/SoknadReadMode';
import {PunchStep, TimeFormat}                                              from 'app/models/enums';
import {IFagsak, IMappe, IMapperOgFagsakerState, IPeriodeinfo, IPunchState, Soknad} from 'app/models/types';
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
}                                                                           from 'app/state/actions';
import {RootStateType}                                                      from 'app/state/RootState';
import {datetime, getHash, setHash}                                         from 'app/utils';
import {AlertStripeFeil, AlertStripeInfo}                     from 'nav-frontend-alertstriper';
import {Knapp}                                                from 'nav-frontend-knapper';
import ModalWrapper                                           from 'nav-frontend-modal';
import NavFrontendSpinner                                     from 'nav-frontend-spinner';
import * as React                                             from 'react';
import {injectIntl, WrappedComponentProps}                    from 'react-intl';
import {connect}                                              from 'react-redux';

export interface IMapperOgFagsakerStateProps {
    punchState: IPunchState;
    mapperOgFagsakerState: IMapperOgFagsakerState;
}

export interface IMapperOgFagsakerDispatchProps {
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

export interface IMapperOgFagsakerComponentProps {
    journalpostid:  string;
    ident:          string;
    getPunchPath:   (step: PunchStep, values?: any) => string;
}

type IMapperOgFagsakerProps = WrappedComponentProps &
                              IMapperOgFagsakerComponentProps &
                              IMapperOgFagsakerStateProps &
                              IMapperOgFagsakerDispatchProps;

export const MapperOgFagsakerComponent: React.FunctionComponent<IMapperOgFagsakerProps> = (props: IMapperOgFagsakerProps) => {

    const {intl, punchState, mapperOgFagsakerState, getPunchPath, ident} = props;
    const {mapper, fagsaker} = mapperOgFagsakerState;

    React.useEffect(() => {
        if (!!ident && ident !== '') {
            props.setIdentAction(ident);
            props.findMapper(ident);
            props.findFagsaker(ident);
            props.setStepAction(PunchStep.CHOOSE_SOKNAD);
        } else {
            setHash(getPunchPath(PunchStep.IDENT));
        }
    }, [ident]);

    if (!!mapperOgFagsakerState.mappeid) {
        props.resetMappeidAction();
        setHash(getPunchPath(PunchStep.FILL_FORM, {id: mapperOgFagsakerState.mappeid}));
        return null;
    }

    if (!ident || ident === '' || !getHash().match(getPunchPath(PunchStep.CHOOSE_SOKNAD, {ident: ''}))) {
        return null;
    }

    const backButton = <p><Knapp onClick={undoSearchForMapperAndFagsaker}>Tilbake</Knapp></p>;

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
        setHash(getPunchPath(PunchStep.FILL_FORM, {id: mappe.mappe_id}));
    };

    function showMapper() {

        const modaler = [];
        const rows = [];

        for (const mappe of mapper) {
            const mappeid = mappe.mappe_id as string;
            const {chosenMappe} = props.mapperOgFagsakerState;
            const soknad = new Soknad(mappe.personlig?.[Object.keys(mappe.personlig)[0]]?.innhold || {});
            const rowContent = [
                !!soknad?.barn?.norsk_ident ? soknad.barn.norsk_ident : soknad?.barn?.foedselsdato,
                soknad?.getFom(), // Viser tidligste startdato
                soknad?.getTom() // Viser seneste sluttdato
            ];
            rows.push(
                <tr key={mappeid} onClick={() => props.openMappeAction(mappe)}>
                    {rowContent.filter(v => !!v).length
                        ? rowContent.map((v, i) => <td key={`${mappeid}_${i}`}>{v}</td>)
                        : <td colSpan={4} className="punch_mappetabell_tom_soknad">Tom søknad</td>}
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    key={mappeid}
                    onRequestClose={props.closeMappeAction}
                    contentLabel={mappeid}
                    isOpen={!!chosenMappe && mappeid === chosenMappe.mappe_id}
                >
                    <div className="modal_content">
                        {chosenMappe?.personlig?.[ident!]?.innhold && <SoknadReadMode soknad={chosenMappe.personlig[ident!].innhold!}/>}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => chooseMappe(mappe)}>Velg denne</Knapp>
                            <Knapp className="knapp2" onClick={props.closeMappeAction}>Lukk</Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            );
        }

        return <>
            <h2>Ufullstendige søknader</h2>
            <table className="tabell tabell--stripet punch_mappetabell">
                <thead>
                    <tr>
                        <th>Barnets fødsels-/D-nr. eller fødselsdato</th>
                        <th>Fra og med</th>
                        <th>Til og med</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            {modaler}
        </>;
    }

    function showFagsaker() {

        const modaler = [];
        const rows = [];

        for (const fagsak of fagsaker) {
            const {fagsak_id, barn, fra_og_med, til_og_med} = fagsak;
            const {chosenFagsak} = props.mapperOgFagsakerState;
            rows.push(
                <tr key={fagsak_id} onClick={() => props.openFagsakAction(fagsak)}>
                    <td>{barn?.navn}</td>
                    <td>{barn?.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, barn.foedselsdato)}</td>
                    <td>{fra_og_med && datetime(intl, TimeFormat.DATE_SHORT, fra_og_med)}</td>
                    <td>{til_og_med && datetime(intl, TimeFormat.DATE_SHORT, til_og_med)}</td>
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
                        <FagsakReadMode {...{fagsak}}/>
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1">Velg denne</Knapp>
                            <Knapp className="knapp2" onClick={props.closeFagsakAction}>Lukk</Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            );
        }

        return <>
            <h2>Fagsaker</h2>
            <table className="tabell tabell--stripet punch_mappetabell">
                <thead>
                    <tr>
                        <th>Barnets navn</th>
                        <th>Fødselsdato</th>
                        <th>Fra og med</th>
                        <th>Til og med</th>
                    </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
            {modaler}
        </>;
    }

    function undoSearchForMapperAndFagsaker() {
        setHash(getPunchPath(PunchStep.IDENT));
        props.undoSearchForMapperAction();
    }

    const newSoknadButton = <p><Knapp onClick={newMappe}>Opprett ny søknad</Knapp></p>;

    if (mapper.length && !fagsaker.length) {
        return <>
            {backButton}
            <AlertStripeInfo>Det finnes ufullstendige søknader knyttet til identitetsnummeret. Velg søknaden som hører til dokumentet eller opprett en ny.</AlertStripeInfo>
            {showMapper()}
            {newSoknadButton}
        </>;
    }

    if (fagsaker.length && !mapper.length) {
        return <>
            {backButton}
            <AlertStripeInfo>Det finnes fagsaker knyttet til identitetsnummeret. Velg saken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
            {newSoknadButton}
            {showFagsaker()}
        </>;
    }

    return <>
        {backButton}
        <AlertStripeInfo>Det finnes ufullstendige søknader og fagsaker knyttet til identitetsnummeret. Velg søknaden eller fagsaken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
        {showMapper()}
        {newSoknadButton}
        {showFagsaker()}
    </>;
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

export const MapperOgFagsaker = injectIntl(connect(mapStateToProps, mapDispatchToProps)(MapperOgFagsakerComponent));
