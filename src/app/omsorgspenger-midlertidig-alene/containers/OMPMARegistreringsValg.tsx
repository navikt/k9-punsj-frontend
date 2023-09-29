import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button } from '@navikt/ds-react';

import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';

import { PunchStep } from '../../models/enums';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { setHash } from '../../utils';
import { createOMPMASoknad, resetOMPMASoknadidAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IEksisterendeOMPMASoknaderState } from '../types/EksisterendeOMPMASoknaderState';
import { EksisterendeOMPMASoknader } from './EksisterendeOMPMASoknader';

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
    eksisterendeSoknaderState: IEksisterendeOMPMASoknaderState;
    identState: IIdentState;
}

type IOMPMARegistreringsValgProps = IOMPMARegistreringsValgComponentProps &
    IOMPMARegistreringsValgDispatchProps &
    IEksisterendeOMPMASoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPMARegistreringsValgProps> = (
    props: IOMPMARegistreringsValgProps,
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;
    const { søkerId, pleietrengendeId, annenPart } = identState;

    React.useEffect(() => {
        if (!!eksisterendeSoknaderState.eksisterendeSoknaderSvar && eksisterendeSoknaderState.isSoknadCreated) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeSoknaderState.soknadid,
                }),
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

    const newSoknad = () => {
        props.createSoknad(journalpostid, søkerId, annenPart);
    };

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (soknader?.length) {
            return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some((eksisterendeSoknad) =>
                // eslint-disable-next-line eqeqeq
                Array.from(eksisterendeSoknad.journalposter!).some((jp) => jp == journalpostid),
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeOMPMASoknader
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
    createSoknad: (journalpostid: string, søkerId: string, annenPart: string) =>
        dispatch(createOMPMASoknad(journalpostid, søkerId, annenPart)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetOMPMASoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPMASoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeOMPMASoknaderState,
    identState: state.identState,
});

export const OMPMARegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
