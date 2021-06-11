import React, {useState} from "react";
import {FormattedMessage} from "react-intl";
import {EksisterendeSoknader} from "./EksisterendeSoknader";
import {PunchStep} from "../../models/enums";
import './registreringsValg.less';
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {createSoknad, resetSoknadidAction, undoSearchForEksisterendeSoknaderAction} from "../../state/actions";
import {connect} from "react-redux";
import {setHash} from "../../utils";
import {AlertStripeFeil} from "nav-frontend-alertstriper";
import {IEksisterendeSoknaderState, IJournalpost, IPleiepengerPunchState} from "../../models/types";
import {RootStateType} from "../../state/RootState";

import {IJournalposterPerIdentState} from "../../models/types/JournalposterPerIdentState";
import {hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction} from "../../state/actions/JournalposterPerIdentActions";

export interface IRegistreringsValgComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IRegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createSoknad;
    resetSoknadidAction: typeof resetSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeSoknaderStateProps {
    punchState: IPleiepengerPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    journalposterState: IJournalposterPerIdentState;
}


type IRegistreringsValgProps = IRegistreringsValgComponentProps & IEksisterendeSoknaderStateProps
    & IRegistreringsValgDispatchProps;

export const RegistreringsValgComponent: React.FunctionComponent<IRegistreringsValgProps> = (props: IRegistreringsValgProps) => {

    const {
        journalpostid,
        ident1,
        ident2,
        getPunchPath,
        eksisterendeSoknaderState,
    } = props;
    const [valgtOption, setValgtOption] = useState<string>("nysoknad");

    React.useEffect(() => {
        if (
            !!eksisterendeSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeSoknaderState.isSoknadCreated
        ) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {id: eksisterendeSoknaderState.soknadid})
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeSoknaderState.soknadid]);

    React.useEffect(() => {
        props.getAlleJournalposter(ident1);
    }, [ident1]);

    const redirectToPreviousStep = () => {
        setHash('/');
        props.undoSearchForEksisterendeSoknaderAction()
    }

    const redirectToNextStep = () => {
        props.createSoknad(journalpostid, ident1, ident2);
        setHash(getPunchPath(PunchStep.FILL_FORM, {id: eksisterendeSoknaderState.soknadid}));
    }

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return (
            <>
                <AlertStripeFeil>
                    Det oppsto en feil under opprettelse av søknad.
                </AlertStripeFeil>
            </>
        );
    }

    const newSoknad = () =>
        props.createSoknad(
            journalpostid,
            ident1,
            ident2
        );

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const infoText = (journalpost: IJournalpost, index: number) => {
        const dato = journalpost.dato ? ", dato: " + journalpost.dato : ""
        return `Journalpost ${index}${dato}`
    }

    const kanStarteNyRegistrering = () => {
        return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some(es => es.journalposter?.has(journalpostid));
    }

    return (
        <div className={"registrering-page"}>
            <EksisterendeSoknader
                {...props}
            />

            <div className="knapperad">
                <Knapp
                    className="knapp knapp1"
                    onClick={redirectToPreviousStep}
                    mini={true}
                >
                    Tilbake
                </Knapp>
                {kanStarteNyRegistrering() &&
                <Hovedknapp
                    onClick={newSoknad}
                    className="knapp knapp2"
                    disabled={valgtOption === ""}
                    mini={true}
                >
                    {<FormattedMessage id={'ident.knapp.nyregistrering'}/>}
                </Hovedknapp>}
            </div>
        </div>

    )
}
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createSoknad(journalpostid, ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (
    state: RootStateType
): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
});


export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
