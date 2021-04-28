import React, {useEffect, useMemo, useState} from "react";
import {RadioGruppe, RadioPanel} from "nav-frontend-skjema";
import {FormattedMessage} from "react-intl";
import {EksisterendeSoknader} from "./EksisterendeSoknader";
import {PunchStep} from "../../models/enums";
import './registreringsValg.less';
import {Knapp} from "nav-frontend-knapper";
import {createSoknad, resetSoknadidAction, undoSearchForEksisterendeSoknaderAction} from "../../state/actions";
import {connect} from "react-redux";
import {apiUrl, setHash} from "../../utils";
import {AlertStripeFeil, AlertStripeInfo} from "nav-frontend-alertstriper";
import {IEksisterendeSoknaderState, IJournalpost, IPleiepengerPunchState} from "../../models/types";
import {RootStateType} from "../../state/RootState";

import {IJournalposterPerIdentState} from "../../models/types/JournalposterPerIdentState";
import {hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction} from "../../state/actions/JournalposterPerIdentActions";
import {ApiPath} from "../../apiConfig";

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
        harTidligereSoknader,
        journalpostid,
        ident1,
        ident2,
        getPunchPath,
        eksisterendeSoknaderState,
        journalposterState
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
        setHash(getPunchPath(PunchStep.IDENT));
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

    if (journalposterState.journalposter.length) {
        return <AlertStripeInfo>
            Det finnes flere journalposter på søkeren
        </AlertStripeInfo>
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


    const pdfUrl = (journalpost: IJournalpost) => {
        return apiUrl(ApiPath.DOKUMENT, {
            journalpostId: journalpost.journalpostId,
            dokumentId: journalpost.dokumenter[0].dokumentId

        })
    }

    const infoText = (journalpost: IJournalpost, index: number) => {
        const dato = journalpost.dato ? ", dato: " + journalpost.dato : ""
        return `Journalpost ${index}${dato}`
    }

    return (
        <div className={"registrering-page"}>
            {journalposterState.journalposter.length > 0 && (
                <div className={"registrering-journalpostinfo"}>
                    <p>
                        Andre journalposter registrert på bruker:
                    </p>
                    {journalposterState.journalposter.map((jp, index) => (
                        <a
                            key={jp.journalpostId}
                            href={pdfUrl(jp)}
                            target="_blank">
                            {infoText(jp, index)}
                        </a>
                    ))
                    }
                </div>)}
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
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (
    state: RootStateType
): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.PLEIEPENGER_SYKT_BARN.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
});


export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
