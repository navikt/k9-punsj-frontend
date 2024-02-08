import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { createPLSSoknad, resetPLSSoknadidAction } from '../state/actions/EksisterendePLSSoknaderActions';
import { IEksisterendePLSSoknaderState } from '../types/EksisterendePLSSoknaderState';
import { EksisterendePLSSoknader } from './EksisterendePLSSoknader';
import './plsRegistreringsValg.less';

export interface IPLSRegistreringsValgComponentProps {
    journalpostid: string;
}

export interface IPLSRegistreringsValgDispatchProps {
    createSoknad: typeof createPLSSoknad;
    resetSoknadidAction: typeof resetPLSSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeSoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendePLSSoknaderState;
    identState: IIdentState;
}

type IPLSRegistreringsValgProps = IPLSRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IPLSRegistreringsValgDispatchProps;

export const PLSRegistreringsValgComponent: React.FunctionComponent<IPLSRegistreringsValgProps> = (
    props: IPLSRegistreringsValgProps,
) => {
    const { journalpostid, identState, eksisterendeSoknaderState } = props;
    const { søkerId, pleietrengendeId } = identState;

    const location = useLocation();

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
            <EksisterendePLSSoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} />
            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace(ROUTES.VELG_SOKNAD, ''))}
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
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createPLSSoknad(journalpostid, søkerId, pleietrengendeId)),
    resetSoknadidAction: () => dispatch(resetPLSSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendePLSSoknaderState,
    identState: state.identState,
});

export const PLSRegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(PLSRegistreringsValgComponent);
