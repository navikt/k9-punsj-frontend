import SoknadReadMode                        from 'app/containers/punch-page/SoknadReadMode';
import {PunchStep}                           from 'app/models/enums';
import {IFagsak, IMappe, IPath, IPunchState} from 'app/models/types';
import {
    chooseMappeAction,
    closeFagsakAction,
    closeMappeAction,
    findFagsaker,
    findMapper,
    newMappeAction,
    openFagsakAction,
    openMappeAction,
    setIdentAction,
    setStepAction,
    undoSearchForMapperAction
}                                            from 'app/state/actions';
import {RootStateType}                       from 'app/state/RootState';
import {changePath, getPath}                 from 'app/utils';
import {AlertStripeInfo}                     from 'nav-frontend-alertstriper';
import {Knapp}                               from 'nav-frontend-knapper';
import ModalWrapper                          from 'nav-frontend-modal';
import NavFrontendSpinner                    from 'nav-frontend-spinner';
import * as React                            from 'react';
import {InjectedIntlProps, injectIntl}       from 'react-intl';
import {connect}                             from 'react-redux';
import {useParams}                           from 'react-router-dom';

interface IMapperOgFagsakerStateProps {
    punchState: IPunchState;
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
    newMappeAction:             typeof newMappeAction;
}

interface IMapperOgFagsakerComponentProps {
    punchPaths: IPath[];
}

type IMapperOgFagsakerProps = InjectedIntlProps &
                              IMapperOgFagsakerComponentProps &
                              IMapperOgFagsakerStateProps &
                              IMapperOgFagsakerDispatchProps;

const MapperOgFagsaker: React.FunctionComponent<IMapperOgFagsakerProps> = (props: IMapperOgFagsakerProps) => {

    const {punchState, punchPaths} = props;
    const {mapper, fagsaker} = punchState;
    const {ident} = useParams();

    if (!ident || ident === '' || !window.location.hash.match(getPath(punchPaths, PunchStep.CHOOSE_SOKNAD, {ident: ''}))) {
        return null;
    }

    if (punchState.mapperRequestError || punchState.fagsakerRequestError) {
        changePath(getPath(punchPaths, PunchStep.START));
        return null;
    }

    if (punchState.isMapperLoading || punchState.isFagsakerLoading) {
        return <div><NavFrontendSpinner/></div>;
    }

    if (ident !== punchState.ident || punchState.step !== PunchStep.CHOOSE_SOKNAD) {
        props.setIdentAction(ident);
        props.findMapper(ident);
        props.findFagsaker(ident);
        return null;
    }

    const newMappe = () => {
        changePath(getPath(punchPaths, PunchStep.FILL_FORM, {id: 'ny'}));
        props.newMappeAction();
    };

    if (!mapper.length && !fagsaker.length) {
        newMappe();
        return null;
    }

    const chooseMappe = (mappe: IMappe) => {
        props.chooseMappeAction(mappe);
        changePath(getPath(props.punchPaths, PunchStep.FILL_FORM, {id: mappe.mappe_id}));
    };

    function showMapper() {

        const modaler = [];
        const rows = [];

        for (const mappe of mapper) {
            const {mappe_id} = mappe;
            const {chosenMappe} = props.punchState;
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
            const {chosenFagsak} = props.punchState;
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
        changePath(getPath(props.punchPaths, PunchStep.START));
        props.undoSearchForMapperAction();
    }

    const backButton = <p><Knapp onClick={undoSearchForMapperAndFagsaker}>Gå tilbake</Knapp></p>;
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

const mapStateToProps = (state: RootStateType) => ({punchState: state.punchState});

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
    newMappeAction:             ()                      => dispatch(newMappeAction())
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MapperOgFagsaker));
