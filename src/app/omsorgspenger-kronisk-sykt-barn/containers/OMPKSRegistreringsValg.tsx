import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux'
import {PunchStep} from '../../models/enums';
import {
    createOMPKSSoknad, resetOMPKSSoknadidAction
} from '../state/actions/EksisterendeOMPKSSoknaderActions';
import {hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction} from '../../state/actions/JournalposterPerIdentActions';
import {IJournalposterPerIdentState} from '../../models/types/Journalpost/JournalposterPerIdentState';
import {IIdentState} from '../../models/types/IdentState';
import {IEksisterendeSoknaderState, IJournalpost, IPunchState} from '../../models/types';
import {setHash} from '../../utils';
import {EksisterendeOMPKSSoknader} from './EksisterendeOMPKSSoknader';
import {RootStateType} from '../../state/RootState';

export interface IOMPKSRegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IOMPKSRegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createOMPKSSoknad;
    resetSoknadidAction: typeof resetOMPKSSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeOMPKSSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

type IOMPKSRegistreringsValgProps = IOMPKSRegistreringsValgComponentProps &
    IOMPKSRegistreringsValgDispatchProps &
    IEksisterendeOMPKSSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPKSRegistreringsValgProps> = (
    props: IOMPKSRegistreringsValgProps
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
            <EksisterendeOMPKSSoknader
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
        dispatch(createOMPKSSoknad(journalpostid, ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetOMPKSSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPKSSoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

export const OMPKSRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
