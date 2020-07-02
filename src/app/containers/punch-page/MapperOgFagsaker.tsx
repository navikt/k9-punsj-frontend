import FagsakReadMode                                                from 'app/containers/punch-page/FagsakReadMode';
import SoknadReadMode                                                from 'app/containers/punch-page/SoknadReadMode';
import {PunchStep, TimeFormat}                                                  from 'app/models/enums';
import {IFagsak, IMappe, IMapperOgFagsakerState, IPleiepengerPunchState, Mappe} from 'app/models/types';
import {IdentRules}                                                             from 'app/rules';
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
    resetPunchAction,
    setIdentAction,
    setStepAction,
    undoSearchForMapperAction
}                                                                    from 'app/state/actions';
import {RootStateType}                                               from 'app/state/RootState';
import {datetime, setHash}                                           from 'app/utils';
import intlHelper                                                    from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeInfo}                            from 'nav-frontend-alertstriper';
import {Knapp}                                                       from 'nav-frontend-knapper';
import ModalWrapper                                                  from 'nav-frontend-modal';
import NavFrontendSpinner                                            from 'nav-frontend-spinner';
import * as React                                                    from 'react';
import {injectIntl, WrappedComponentProps}                           from 'react-intl';
import {connect}                                                     from 'react-redux';

export interface IMapperOgFagsakerStateProps {
    punchState: IPleiepengerPunchState;
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
    resetPunchAction:           typeof resetPunchAction;
}

export interface IMapperOgFagsakerComponentProps {
    journalpostid:  string;
    ident1:         string;
    ident2:         string | null;
    getPunchPath:   (step: PunchStep, values?: any) => string;
}

type IMapperOgFagsakerProps = WrappedComponentProps &
                              IMapperOgFagsakerComponentProps &
                              IMapperOgFagsakerStateProps &
                              IMapperOgFagsakerDispatchProps;

export const MapperOgFagsakerComponent: React.FunctionComponent<IMapperOgFagsakerProps> = (props: IMapperOgFagsakerProps) => {

    const {intl, punchState, mapperOgFagsakerState, getPunchPath, ident1, ident2} = props;
    const {mapper, fagsaker} = mapperOgFagsakerState;

    React.useEffect(() => {
        if (IdentRules.areIdentsValid(ident1, ident2)) {
            props.setIdentAction(ident1, ident2);
            props.findMapper(ident1, ident2);
            props.findFagsaker(ident1);
            props.setStepAction(PunchStep.CHOOSE_SOKNAD);
        } else {
            props.setStepAction(PunchStep.IDENT);
            props.resetPunchAction();
            setHash(getPunchPath(PunchStep.IDENT));
        }
    }, [ident1, ident2]);

    React.useEffect(() => {
        if (!!mapperOgFagsakerState.mappeid && mapperOgFagsakerState.isMappeCreated) {
            setHash(getPunchPath(PunchStep.FILL_FORM, {id: mapperOgFagsakerState.mappeid}));
            props.resetMappeidAction();
        }
    }, [mapperOgFagsakerState.mappeid]);

    if (!ident1 || ident1 === '') {
        return null;
    }

    const backButton = <p><Knapp onClick={undoSearchForMapperAndFagsaker}>Tilbake</Knapp></p>;

    if (mapperOgFagsakerState.mapperRequestError || mapperOgFagsakerState.fagsakerRequestError) {
        return <>
            <AlertStripeFeil>Det oppsto en feil i henting av mapper.</AlertStripeFeil>
            {backButton}
        </>;
    }

    if (punchState.step !== PunchStep.CHOOSE_SOKNAD ||
        mapperOgFagsakerState.isMapperLoading ||
        mapperOgFagsakerState.isFagsakerLoading ||
        mapperOgFagsakerState.isAwaitingMappeCreation) {
        return <div><NavFrontendSpinner/></div>;
    }

    if (mapperOgFagsakerState.createMappeRequestError) {
        return <>
            <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>
            {backButton}
        </>;
    }

    const newMappe = () => props.createMappe(props.journalpostid, punchState.ident1, punchState.ident2);

    const technicalError = mapperOgFagsakerState.isMappeCreated && !mapperOgFagsakerState.mappeid
        ? <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        : null;

    const chooseMappe = (mappe: IMappe) => {
        props.chooseMappeAction(mappe);
        setHash(getPunchPath(PunchStep.FILL_FORM, {id: mappe.mappeId}));
    };

    function showMapper() {

        const modaler = [];
        const rows = [];

        for (const iMappe of mapper) {
            const mappe = new Mappe(iMappe);
            const mappeid = mappe.mappeId as string;
            const {chosenMappe} = props.mapperOgFagsakerState;
            const dobbelSoknad = mappe.genererDobbelSoknad();
            const {felles} = dobbelSoknad;
            const fom = dobbelSoknad.getFom();
            const tom = dobbelSoknad.getTom();
            const rowContent = [
                !!felles.datoMottatt ? datetime(intl, TimeFormat.DATE_SHORT, felles.datoMottatt) : '',
                (!!felles.barn.norskIdent ? felles.barn.norskIdent : (felles.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, felles.barn.foedselsdato))) || '',
                !!fom ? datetime(intl, TimeFormat.DATE_SHORT, fom) : '', // Viser tidligste startdato
                !!tom ? datetime(intl, TimeFormat.DATE_SHORT, tom) : '' // Viser seneste sluttdato
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
                    isOpen={!!chosenMappe && mappeid === chosenMappe.mappeId}
                >
                    <div className="modal_content">
                        {chosenMappe?.personer?.[ident1!]?.soeknad && <SoknadReadMode mappe={new Mappe(chosenMappe)}/>}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => chooseMappe(mappe)}>{intlHelper(intl, 'mappe.lesemodus.knapp.velg')}</Knapp>
                            <Knapp className="knapp2" onClick={props.closeMappeAction}>{intlHelper(intl, 'mappe.lesemodus.knapp.lukk')}</Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            );
        }

        return <>
            <h2>{intlHelper(intl, 'mapper.tabell.overskrift')}</h2>
            <table className="tabell tabell--stripet punch_mappetabell">
                <thead>
                    <tr>
                        <th>{intlHelper(intl, 'mapper.tabell.mottakelsesdato')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.barnetsfnrellerfdato')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.fraogmed')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.tilogmed')}</th>
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
            {technicalError}
            <AlertStripeInfo>{intlHelper(intl, 'mapper.infoboks', {antallSokere: ident2 ? '2' : '1'})}</AlertStripeInfo>
            {showMapper()}
            {newSoknadButton}
        </>;
    }

    if (fagsaker.length && !mapper.length) {
        return <>
            {backButton}
            {technicalError}
            <AlertStripeInfo>Det finnes fagsaker knyttet til identitetsnummeret. Velg saken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
            {newSoknadButton}
            {showFagsaker()}
        </>;
    }

    if (mapper.length && fagsaker.length) {
        return <>
            {backButton}
            {technicalError}
            <AlertStripeInfo>Det finnes ufullstendige søknader og fagsaker knyttet til identitetsnummeret. Velg søknaden eller fagsaken som hører til dokumentet eller opprett en ny søknad.</AlertStripeInfo>
            {showMapper()}
            {newSoknadButton}
            {showFagsaker()}
        </>;
    }

    return <>
        {backButton}
        {technicalError}
        <AlertStripeInfo>{intlHelper(intl, 'mapper.infoboks.ingensoknader', {antallSokere: ident2 ? '2' : '1'})}</AlertStripeInfo>
        {newSoknadButton}
    </>;
};

const mapStateToProps = (state: RootStateType) => ({
    punchState:             state.punchState,
    mapperOgFagsakerState:  state.mapperOgFagsakerState
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction:             (ident1: string,
                                 ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction:              (step: PunchStep)       => dispatch(setStepAction(step)),
    findMapper:                 (ident1: string,
                                 ident2: string | null) => dispatch(findMapper(ident1, ident2)),
    findFagsaker:               (ident: string)         => dispatch(findFagsaker(ident)),
    undoSearchForMapperAction:  ()                      => dispatch(undoSearchForMapperAction()),
    openMappeAction:            (mappe: IMappe)         => dispatch(openMappeAction(mappe)),
    closeMappeAction:           ()                      => dispatch(closeMappeAction()),
    openFagsakAction:           (fagsak: IFagsak)       => dispatch(openFagsakAction(fagsak)),
    closeFagsakAction:          ()                      => dispatch(closeFagsakAction()),
    chooseMappeAction:          (mappe: IMappe)         => dispatch(chooseMappeAction(mappe)),
    createMappe:                (journalpostid: string,
                                 ident1: string,
                                 ident2: string | null) => dispatch(createMappe(journalpostid, ident1, ident2)),
    resetMappeidAction:         ()                      => dispatch(resetMappeidAction()),
    resetPunchAction:           ()                      => dispatch(resetPunchAction())
});

export const MapperOgFagsaker = injectIntl(connect(mapStateToProps, mapDispatchToProps)(MapperOgFagsakerComponent));
