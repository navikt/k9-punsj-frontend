import React, {useState} from "react";
import {RadioGruppe, RadioPanel} from "nav-frontend-skjema";
import {FormattedMessage} from "react-intl";
import {EksisterendeSoknader} from "./EksisterendeSoknader";
import {PunchStep} from "../../models/enums";
import './registreringsValg.less';
import {Knapp} from "nav-frontend-knapper";
import {createSoknad, resetSoknadidAction, undoSearchForEksisterendeSoknaderAction} from "../../state/actions";
import {connect} from "react-redux";
import {setHash} from "../../utils";
import {AlertStripeFeil} from "nav-frontend-alertstriper";
import {IEksisterendeSoknaderState, IPleiepengerPunchState} from "../../models/types";
import {RootStateType} from "../../state/RootState";


export interface IRegistreringsValgComponentProps {
    harTidligereSoknader: boolean;
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IRegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createSoknad;
    resetSoknadidAction: typeof resetSoknadidAction;
}

export interface IEksisterendeSoknaderStateProps {
    punchState: IPleiepengerPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
}


type IRegistreringsValgProps = IRegistreringsValgComponentProps & IEksisterendeSoknaderStateProps
    & IRegistreringsValgDispatchProps;

export const RegistreringsValgComponent: React.FunctionComponent<IRegistreringsValgProps> = (props: IRegistreringsValgProps) => {

    const {harTidligereSoknader, journalpostid, ident1, ident2, getPunchPath, eksisterendeSoknaderState} = props;
    const [valgtOption, setValgtOption] = useState<string>("nysoknad");

    React.useEffect(() => {
        if (
            !!eksisterendeSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeSoknaderState.isSoknadCreated
        ) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, { id: eksisterendeSoknaderState.soknadid })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeSoknaderState.soknadid]);

    const redirectToPreviousStep = () => {
            setHash(getPunchPath(PunchStep.IDENT));
            props.undoSearchForEksisterendeSoknaderAction()
    }

    const redirectToNextStep = () => {
        props.createSoknad(journalpostid, ident1, ident2);
        setHash(getPunchPath(PunchStep.FILL_FORM));
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


    return (
        <div className={"registrering-page"}>
            <RadioGruppe
                legend={<FormattedMessage id={"registrering.overskrift"}/>}
                className="registrering-page__options"
            >
                <RadioPanel
                    label={<FormattedMessage id={"registrering.nysoknad"}/>}
                    onChange={() => setValgtOption("nysoknad")}
                    checked={valgtOption === "nysoknad"}
                />
                <RadioPanel
                    label={<FormattedMessage id={"registrering.etterrapportering"}/>}
                    onChange={() => setValgtOption("etterrapportering")}
                    checked={valgtOption === "etterrapportering"}
                />
            </RadioGruppe>

            {harTidligereSoknader &&

            (<EksisterendeSoknader
                {...props}
            />)
            }
            <div className="knapperad">
                <Knapp
                    className="knapp knapp1"
                    onClick={redirectToPreviousStep}
                >
                    Tilbake
                </Knapp>
                <Knapp
                    onClick={newSoknad}
                    className="knapp knapp2"
                    disabled={valgtOption === ""}
                >
                    {<FormattedMessage id={'ident.knapp.nestesteg'}/>}
                </Knapp>
            </div>
        </div>

    )
}
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createSoknad(journalpostid, ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
});

const mapStateToProps = (
    state: RootStateType
): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.PLEIEPENGER_SYKT_BARN.eksisterendeSoknaderState,
});


export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
