import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { undoSearchForEksisterendeSoknaderAction } from 'app/state/actions';
import { ROUTES } from 'app/constants/routes';

import { PunchStep } from '../../models/enums';
import { IEksisterendeSoknaderState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { createOMPKSSoknad, resetOMPKSSoknadidAction } from '../state/actions/EksisterendeOMPKSSoknaderActions';
import { EksisterendeOMPKSSoknader } from './EksisterendeOMPKSSoknader';

export interface IOMPKSRegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IOMPKSRegistreringsValgDispatchProps {
    createSoknad: typeof createOMPKSSoknad;
    resetSoknadidAction: typeof resetOMPKSSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeOMPKSSoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    identState: IIdentState;
}

type IOMPKSRegistreringsValgProps = IOMPKSRegistreringsValgComponentProps &
    IOMPKSRegistreringsValgDispatchProps &
    IEksisterendeOMPKSSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPKSRegistreringsValgProps> = (
    props: IOMPKSRegistreringsValgProps,
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;

    const { søkerId, pleietrengendeId } = identState;

    const navigate = useNavigate();

    React.useEffect(() => {
        if (
            !!eksisterendeSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeSoknaderState.isSoknadCreated &&
            eksisterendeSoknaderState.soknadid
        ) {
            props.resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', eksisterendeSoknaderState.soknadid)}`);
        }
    }, [eksisterendeSoknaderState.soknadid]);

    React.useEffect(() => {
        props.getAlleJournalposter(søkerId);
    }, [søkerId]);

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
            <EksisterendeOMPKSSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
                getPunchPath={getPunchPath}
                journalpostid={journalpostid}
            />

            <div className="knapperad">
                <Button variant="secondary" className="knapp knapp1" onClick={() => navigate(-1)} size="small">
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
        dispatch(createOMPKSSoknad(journalpostid, søkerId, pleietrengendeId)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetOMPKSSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPKSSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    identState: state.identState,
});

export const OMPKSRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
