import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button } from '@navikt/ds-react';

import { PunchStep } from '../../models/enums';
import { IEksisterendeSoknaderState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { createSoknad, resetSoknadidAction, undoSearchForEksisterendeSoknaderAction } from '../../state/actions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { setHash } from '../../utils';
import { EksisterendeSoknader } from './EksisterendeSoknader';
import './registreringsValg.less';

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
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    identState: IIdentState;
}

type IRegistreringsValgProps = IRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IRegistreringsValgDispatchProps;

export const RegistreringsValgComponent: React.FunctionComponent<IRegistreringsValgProps> = (
    props: IRegistreringsValgProps,
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;

    const { søkerId, pleietrengendeId } = identState;

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

    const newSoknad = () => props.createSoknad(journalpostid, søkerId, pleietrengendeId);

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (soknader?.length) {
            return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some((es) =>
                Array.from(es.journalposter!).some((jp) => jp === journalpostid),
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeSoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} getPunchPath={getPunchPath} />

            <div className="knapperad">
                <Button variant="secondary" className="knapp1" onClick={redirectToPreviousStep} size="small">
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button onClick={newSoknad} className="knapp2" size="small">
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createSoknad(journalpostid, søkerId, pleietrengendeId)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    identState: state.identState,
});

export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
