import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IdentRules } from 'app/rules';
import { IEksisterendeSoknaderState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { createSoknad, findEksisterendeSoknader, resetSoknadidAction } from '../../state/actions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { EksisterendeSoknader } from './EksisterendeSoknader';
import './registreringsValg.less';

export interface IRegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IRegistreringsValgDispatchProps {
    createSoknad: typeof createSoknad;
    resetSoknadidAction: typeof resetSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
    findEksisterendeSoknader: typeof findEksisterendeSoknader;
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
    const navigate = useNavigate();
    const location = useLocation();

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const { journalpostid, identState, eksisterendeSoknaderState } = props;
    const { søkerId, pleietrengendeId } = identState;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!fordelingState.dokumenttype) {
            navigate(location.pathname.replace('soknader', ''));
        }
    }, []);

    useEffect(() => {
        if (IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            props.findEksisterendeSoknader(søkerId, null);
        }
    }, [søkerId, pleietrengendeId]);

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
            <EksisterendeSoknader pleietrengendeId={pleietrengendeId} />
            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace('soknader', ''))}
                    size="small"
                >
                    <FormattedMessage id="fordeling.registreringsValg.tilbake" />
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
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    findEksisterendeSoknader: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(findEksisterendeSoknader(søkerId, pleietrengendeId)),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    identState: state.identState,
});

export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
