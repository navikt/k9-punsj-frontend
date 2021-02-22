import SoknadReadMode from 'app/containers/pleiepenger/SoknadReadMode';
import { PunchStep, TimeFormat } from 'app/models/enums';
import {
    IMappe,
    IMapperSokState, IPath, IPeriode,
    Mappe, Periode,
} from 'app/models/types';
import {
    chooseMappeAction,
    closeFagsakAction,
    closeMappeAction,
    createMappe,
    sokMapper,
    openMappeAction,
    resetMappeidAction,
    resetPunchAction,
    setIdentAction,
    undoSearchForMapperAction, sokPsbMapper,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { datetime, setHash, getPath } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import {connect} from 'react-redux';
import {IMapperVisningState} from "../../models/types/MapperVisningState";
import {MapperVisningStep} from "../../models/enums/MapperVisningStep";
import {setIdentSokAction, setStepSokAction} from "../../state/actions/MapperSokActions";
import {SoknadType} from "../../models/enums/SoknadType";
import {ISoknadPeriode} from "../../models/types/HentSoknad";

export interface IMapperSokStateProps {
    visningState: IMapperVisningState;
    mapperSokState: IMapperSokState;
}

export interface IMapperSokDispatchProps {
    setIdentAction: typeof setIdentSokAction;
    setStepAction: typeof setStepSokAction;
    findMapper: typeof sokPsbMapper;
    undoSearchForMapperAction: typeof undoSearchForMapperAction;
    openMappeAction: typeof openMappeAction;
    closeMappeAction: typeof closeMappeAction;
    closeFagsakAction: typeof closeFagsakAction;
    chooseMappeAction: typeof chooseMappeAction;
    createMappe: typeof createMappe;
    resetMappeidAction: typeof resetMappeidAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IMapperVisningComponentProps {
    ident: string;
    periode: ISoknadPeriode;

}

type IMapperSokProps = WrappedComponentProps &
    IMapperVisningComponentProps &
    IMapperSokStateProps &
    IMapperSokDispatchProps;

export const MapperVisningComponent: React.FunctionComponent<IMapperSokProps> = (
    props: IMapperSokProps
) => {
    const {
        intl,
        mapperSokState,
        visningState,
        ident,
        periode,
    } = props;
    const {mapper} = mapperSokState;

    const paths: IPath[] = [
        { step: PunchStep.IDENT, path: `/pleiepenger/ident` },
        {
            step: PunchStep.CHOOSE_SOKNAD,
            path: `/pleiepenger/hentsoknader`,
        },
        { step: PunchStep.FILL_FORM, path: `/pleiepenger/skjema/{id}` },
        { step: PunchStep.COMPLETED, path: `$/pleiepenger/fullfort` },
    ];

const getPunchPath = (step: PunchStep, values?: any) => {
        return getPath(
            paths,
            step,
            values,
           undefined
        );
};

    React.useEffect(() => {
        props.setIdentAction(ident);
        props.findMapper(ident, null, periode);
        props.setStepAction(MapperVisningStep.CHOOSE_SOKNAD);
    }, [ident]);

    React.useEffect(() => {
        if (
            !!mapperSokState.mappeid &&
            mapperSokState.isMappeCreated
        ) {
            props.resetMappeidAction();
        }
    }, [mapperSokState.mappeid]);

    if (!ident) {
        return null;
    }

    const backButton = (
        <p>
            <Knapp onClick={undoSearchForMapperAndFagsaker}>Tilbake</Knapp>
        </p>
    );

    if (mapperSokState.mapperRequestError) {
        return (
            <>
                <AlertStripeFeil>
                    Det oppsto en feil i henting av mapper.
                </AlertStripeFeil>
                {backButton}
            </>
        );
    }

    if (
        visningState.step !== MapperVisningStep.CHOOSE_SOKNAD ||
        mapperSokState.isMapperLoading ||
        mapperSokState.isAwaitingMappeCreation
    ) {
        return (
            <div>
                <NavFrontendSpinner/>
            </div>
        );
    }

    const technicalError =
        mapperSokState.isMappeCreated && !mapperSokState.mappeid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const chooseMappe = (mappe: IMappe) => {
        window.history.pushState("","", "/rediger");
        props.chooseMappeAction(mappe);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: mappe.mappeId }));
    };

    function showMapper() {
        const modaler = [];
        const rows = [];

        for (const iMappe of mapper) {
            const mappe = new Mappe(iMappe);
            const mappeid = mappe.mappeId as string;
            const {chosenMappe} = props.mapperSokState;
            const dobbelSoknad = mappe.genererDobbelSoknad();
            const {felles} = dobbelSoknad;
            const fom = dobbelSoknad.getFom();
            const tom = dobbelSoknad.getTom();
            const rowContent = [
                !!felles.datoMottatt
                    ? datetime(intl, TimeFormat.DATE_SHORT, felles.datoMottatt)
                    : '',
                SoknadType[mappe.søknadType],
                (!!felles.barn.norskIdent
                    ? felles.barn.norskIdent
                    : felles.barn.foedselsdato &&
                    datetime(intl, TimeFormat.DATE_SHORT, felles.barn.foedselsdato)) ||
                '',
                !!fom ? datetime(intl, TimeFormat.DATE_SHORT, fom) : '', // Viser tidligste startdato
                !!tom ? datetime(intl, TimeFormat.DATE_SHORT, tom) : '', // Viser seneste sluttdato
            ];
            rows.push(
                <tr key={mappeid} onClick={() => props.openMappeAction(mappe)}>
                    {rowContent.filter((v) => !!v).length ? (
                        rowContent.map((v, i) => <td key={`${mappeid}_${i}`}>{v}</td>)
                    ) : (
                        <td colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </td>
                    )}
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
                        {chosenMappe?.personer?.[ident!]?.soeknad && (
                            <SoknadReadMode mappe={new Mappe(chosenMappe)}/>
                        )}
                        <div className="punch_mappemodal_knapperad">
                            <Knapp className="knapp1" onClick={() => chooseMappe(mappe)}>
                                {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                            </Knapp>
                            <Knapp className="knapp2" onClick={props.closeMappeAction}>
                                {intlHelper(intl, 'mappe.lesemodus.knapp.lukk')}
                            </Knapp>
                        </div>
                    </div>
                </ModalWrapper>
            );
        }

        return (
            <>
                <h2>{intlHelper(intl, 'mapper.tabell.overskrift')}</h2>
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                    <tr>
                        <th>{intlHelper(intl, 'mapper.tabell.mottakelsesdato')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.søknadtype')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.fnrellerdato')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.fraogmed')}</th>
                        <th>{intlHelper(intl, 'mapper.tabell.tilogmed')}</th>
                    </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
                {modaler}
            </>
        );
    }


    function undoSearchForMapperAndFagsaker() {
        props.undoSearchForMapperAction();
    }

    if (mapper.length) {
        return (
            <>
                {technicalError}
                <AlertStripeInfo>
                    {intlHelper(intl, 'mapper.visning.infoboks', {
                        antallSokere: '1',
                    })}
                </AlertStripeInfo>
                {showMapper()}
            </>
        );
    }

    return (
        <>
            {technicalError}
            <AlertStripeInfo>
                {intlHelper(intl, 'mapper.infoboks.ingentreff', {
                    antallSokere: '1',
                })}
            </AlertStripeInfo>
        </>
    );
};


const mapStateToProps = (
    state: RootStateType
): IMapperSokStateProps => ({
    visningState: state.SØK.visningState,
    mapperSokState: state.SØK.mapperSokState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) =>
        dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: MapperVisningStep) => dispatch(setStepSokAction(step)),
    findMapper: (ident1: string, ident2: string | null, periode: ISoknadPeriode) =>
        dispatch(sokPsbMapper(ident1, ident2, periode)),
    undoSearchForMapperAction: () => dispatch(undoSearchForMapperAction()),
    openMappeAction: (mappe: IMappe) => dispatch(openMappeAction(mappe)),
    closeMappeAction: () => dispatch(closeMappeAction()),
    closeFagsakAction: () => dispatch(closeFagsakAction()),
    chooseMappeAction: (mappe: IMappe) => dispatch(chooseMappeAction(mappe)),
    createMappe: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createMappe(journalpostid, ident1, ident2)),
    resetMappeidAction: () => dispatch(resetMappeidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const MapperVisning = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(MapperVisningComponent)
);
