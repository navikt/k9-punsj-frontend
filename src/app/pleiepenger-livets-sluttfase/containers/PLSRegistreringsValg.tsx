import { Alert, Button } from '@navikt/ds-react';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';
import { PunchStep } from '../../models/enums';
import { IPunchState } from '../../models/types';
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

    const { søkerId, pleietrengendeId } = identState;

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
        props.getAlleJournalposter(søkerId);
    }, [søkerId]);

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

    const newSoknad = () => props.createSoknad(journalpostid, søkerId, pleietrengendeId);

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
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
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
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId)),
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
