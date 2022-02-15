import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';
import { PunchStep } from '../../models/enums';
import { IJournalpost, IPunchState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { RootStateType } from '../../state/RootState';
import { setHash } from '../../utils';
import './plsRegistreringsValg.less';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { EksisterendePLSSoknader } from './EksisterendePLSSoknader';
import { createPLSSoknad, resetPLSSoknadidAction } from '../state/actions/EksisterendePLSSoknaderActions';
import { IEksisterendePLSSoknaderState } from '../types/EksisterendePLSSoknaderState';

export interface IPLSRegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IPLSRegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createPLSSoknad;
    resetSoknadidAction: typeof resetPLSSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendePLSSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

type IPLSRegistreringsValgProps = IPLSRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IPLSRegistreringsValgDispatchProps;

export const PLSRegistreringsValgComponent: React.FunctionComponent<IPLSRegistreringsValgProps> = (
    props: IPLSRegistreringsValgProps
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
        return <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>;
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
            <EksisterendePLSSoknader
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
        dispatch(createPLSSoknad(journalpostid, ident1, ident2)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetPLSSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchState,
    eksisterendeSoknaderState: state.eksisterendePLSSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

export const PLSRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(PLSRegistreringsValgComponent);
