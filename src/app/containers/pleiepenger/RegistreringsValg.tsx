import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { PunchStep } from '../../models/enums';
import { IEksisterendeSoknaderState, IJournalpost, IPleiepengerPunchState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { createSoknad, resetSoknadidAction, undoSearchForEksisterendeSoknaderAction } from '../../state/actions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { RootStateType } from '../../state/RootState';
import { setHash } from '../../utils';
import { EksisterendeSoknader } from './EksisterendeSoknader';
import './registreringsValg.less';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';

export interface IRegistreringsValgComponentProps {
    journalpostid: string;
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
    identState: IIdentState;
}

type IRegistreringsValgProps = IRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IRegistreringsValgDispatchProps;

export const RegistreringsValgComponent: React.FunctionComponent<IRegistreringsValgProps> = (
    props: IRegistreringsValgProps
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;
    const [valgtOption, setValgtOption] = useState<string>('nysoknad');

    const { ident1, ident2 } = identState;

    React.useEffect(() => {
        if (!!eksisterendeSoknaderState.eksisterendeSoknaderSvar && eksisterendeSoknaderState.isSoknadCreated) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeSoknaderState.soknadid,
                })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeSoknaderState.soknadid]);

    React.useEffect(() => {
        props.getAlleJournalposter(ident1);
    }, [ident1]);

    const redirectToPreviousStep = () => {
        setHash('/');
        props.undoSearchForEksisterendeSoknaderAction();
    };

    const redirectToNextStep = () => {
        props.createSoknad(journalpostid, ident1, ident2);
        setHash(
            getPunchPath(PunchStep.FILL_FORM, {
                id: eksisterendeSoknaderState.soknadid,
            })
        );
    };

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return (
            <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>
        );
    }

    const newSoknad = () => props.createSoknad(journalpostid, ident1, ident2);

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
        ) : null;

    const infoText = (journalpost: IJournalpost, index: number) => {
        const dato = journalpost.dato ? `, dato: ${journalpost.dato}` : '';
        return `Journalpost ${index}${dato}`;
    };

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (soknader?.length) {
            return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some((es) =>
                Array.from(es.journalposter!).some((jp) => jp === journalpostid)
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeSoknader
                ident1={ident1}
                ident2={ident2}
                getPunchPath={getPunchPath}
                journalpostid={journalpostid}
            />

            <div className="knapperad">
                <Knapp className="knapp knapp1" onClick={redirectToPreviousStep} mini>
                    Tilbake
                </Knapp>
                {kanStarteNyRegistrering() && (
                    <Hovedknapp onClick={newSoknad} className="knapp knapp2" disabled={valgtOption === ''} mini>
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Hovedknapp>
                )}
            </div>
        </div>
    );
};
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, ident1: string, ident2: string | null) =>
        dispatch(createSoknad(journalpostid, ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
