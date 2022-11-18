import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';
import { Alert, Button } from '@navikt/ds-react';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { PunchStep } from '../../models/enums';
import { createOMPMASoknad, resetOMPMASoknadidAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { IIdentState } from '../../models/types/IdentState';
import { IEksisterendeSoknaderState, IPunchState } from '../../models/types';
import { setHash } from '../../utils';
import { EksisterendeOMPMASoknader } from './EksisterendeOMPMASoknader';
import { RootStateType } from '../../state/RootState';

export interface IOMPMARegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IOMPMARegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createOMPMASoknad;
    resetSoknadidAction: typeof resetOMPMASoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeOMPMASoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

type IOMPMARegistreringsValgProps = IOMPMARegistreringsValgComponentProps &
    IOMPMARegistreringsValgDispatchProps &
    IEksisterendeOMPMASoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPMARegistreringsValgProps> = (
    props: IOMPMARegistreringsValgProps
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;
    const { ident1, ident2, annenPart } = identState;

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
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    const newSoknad = () => {
        props.createSoknad(journalpostid, ident1, annenPart);
    };

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (soknader?.length) {
            return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some((eksisterendeSoknad) =>
                // eslint-disable-next-line eqeqeq
                Array.from(eksisterendeSoknad.journalposter!).some((jp) => jp == journalpostid)
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeOMPMASoknader
                ident1={ident1}
                ident2={ident2}
                getPunchPath={getPunchPath}
                journalpostid={journalpostid}
            />

            <div className="knapperad">
                <Button variant="secondary" className="knapp knapp1" onClick={redirectToPreviousStep} size="small">
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button onClick={newSoknad} className="knapp knapp2" size="small">
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, ident1: string, annenPart: string) =>
        dispatch(createOMPMASoknad(journalpostid, ident1, annenPart)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetOMPMASoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPMASoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

export const OMPMARegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
