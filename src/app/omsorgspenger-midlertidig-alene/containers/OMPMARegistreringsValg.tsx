import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';

import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { createOMPMASoknad, resetOMPMASoknadidAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IEksisterendeOMPMASoknaderState } from '../types/EksisterendeOMPMASoknaderState';
import { EksisterendeOMPMASoknader } from './EksisterendeOMPMASoknader';

export interface IOMPMARegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IOMPMARegistreringsValgDispatchProps {
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
    const navigate = useNavigate();
    const location = useLocation();

    const { journalpostid, identState, eksisterendeSoknaderState } = props;
    const { søkerId, pleietrengendeId, annenPart } = identState;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId) {
            navigate(location.pathname.replace('soknader', ''));
        }
    }, []);

    useEffect(() => {
        if (
            !!eksisterendeSoknaderState.eksisterendeSoknaderSvar &&
            eksisterendeSoknaderState.isSoknadCreated &&
            eksisterendeSoknaderState.soknadid
        ) {
            props.resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', eksisterendeSoknaderState.soknadid)}`);
        }
    }, [eksisterendeSoknaderState.soknadid]);

    useEffect(() => {
        props.getAlleJournalposter(søkerId);
    }, [søkerId]);

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
                Array.from(eksisterendeSoknad.journalposter!).some((jp) => jp === journalpostid),
            );
        }
        return true;
    };

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (!soknader?.length) {
            newSoknad();
        }
    }, [eksisterendeSoknaderState.eksisterendeSoknaderSvar]);

    return (
        <div className="registrering-page">
            <EksisterendeOMPMASoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} />

            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace('soknader', ''))}
                    size="small"
                >
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
    resetSoknadidAction: () => dispatch(resetOMPMASoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeOMPMASoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeOMPMASoknaderState,
    identState: state.identState,
});

export const OMPMARegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
