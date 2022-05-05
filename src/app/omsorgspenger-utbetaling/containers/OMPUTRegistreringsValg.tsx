import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { PunchStep } from '../../models/enums';
import { createOMPUTSoknad, resetOMPUTSoknadidAction } from '../state/actions/EksisterendeOMPUTSoknaderActions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { IIdentState } from '../../models/types/IdentState';
import { IEksisterendeSoknaderState, IPunchState } from '../../models/types';
import { setHash } from '../../utils';
import { EksisterendeOMPUTSoknader } from './EksisterendeOMPUTSoknader';
import { RootStateType } from '../../state/RootState';

export interface IOMPUTRegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IOMPUTRegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createOMPUTSoknad;
    resetSoknadidAction: typeof resetOMPUTSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeOMPUTSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

type IOMPUTRegistreringsValgProps = IOMPUTRegistreringsValgComponentProps &
    IOMPUTRegistreringsValgDispatchProps &
    IEksisterendeOMPUTSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPUTRegistreringsValgProps> = (
    props: IOMPUTRegistreringsValgProps
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;
    const { ident1, ident2, barn } = identState;

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

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return <AlertStripeFeil>Det oppsto en feil under opprettelse av søknad.</AlertStripeFeil>;
    }

    const newSoknad = () => {
        props.createSoknad(
            journalpostid,
            ident1,
            barn.map((barnet) => ({ norskIdent: barnet.identitetsnummer, foedselsdato: '' }))
        );
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
            <EksisterendeOMPUTSoknader
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
                    <Hovedknapp onClick={newSoknad} className="knapp knapp2" mini>
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Hovedknapp>
                )}
            </div>
        </div>
    );
};
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, ident1: string, barn: string[]) =>
        dispatch(createOMPUTSoknad(journalpostid, ident1, barn)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetOMPUTSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPUTSoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

export const OMPUTRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
