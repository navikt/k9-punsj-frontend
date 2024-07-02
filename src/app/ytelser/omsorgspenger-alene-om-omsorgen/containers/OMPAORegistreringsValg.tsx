import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IIdentState } from 'app/models/types/IdentState';
import { RootStateType } from 'app/state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';
import EksisterendeOMPAOSoknader from './EksisterendeOMPAOSoknader';

export interface IOMPAORegistreringsValgComponentProps {
    journalpostid: string;
}
export interface IEksisterendeOMPAOSoknaderStateProps {
    identState: IIdentState;
}

type IOMPAORegistreringsValgProps = IOMPAORegistreringsValgComponentProps & IEksisterendeOMPAOSoknaderStateProps;

export const RegistreringsValgComponent: React.FC<IOMPAORegistreringsValgProps> = (
    props: IOMPAORegistreringsValgProps,
) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { journalpostid, identState } = props;
    const { søkerId, pleietrengendeId } = identState;

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const k9saksnummer = fordelingState.fagsak?.fagsakId;

    const { data: eksisterendeSoeknader, isLoading: isEksisterendeSoknaderLoading } = useQuery(
        'hentSoeknaderOMPAO',
        () => hentEksisterendeSoeknader(søkerId),
    );

    const {
        isLoading: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation(() => api.opprettSoeknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer), {
        onSuccess: (soeknad) => {
            navigate(`../${ROUTES.PUNCH.replace(':id', soeknad?.soeknadId)}`);
        },
    });

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId) {
            navigate(location.pathname.replace('soknader/', ''));
        }
    }, [location.pathname, navigate, søkerId]);

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        const soknader = eksisterendeSoeknader?.søknader;
        if (soknader?.length === 0) {
            opprettSoknad();
        }
    }, [eksisterendeSoeknader?.søknader, opprettSoknad]);

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoeknader?.søknader;
        if (soknader?.length) {
            return !soknader?.some((soknad) =>
                Array.from(soknad?.journalposter || []).some((journalpost) => journalpost === journalpostid),
            );
        }
        return true;
    };

    if (opprettSoknadError instanceof Error) {
        return (
            <Alert size="small" variant="error">
                {opprettSoknadError.message}
            </Alert>
        );
    }

    return (
        <div className="registrering-page">
            <EksisterendeOMPAOSoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} />

            <div className="knapperad">
                <Button
                    variant="secondary"
                    className="knapp knapp1"
                    onClick={() => navigate(location.pathname.replace('soknader/', ''))}
                    size="small"
                    disabled={isEksisterendeSoknaderLoading}
                >
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button
                        onClick={() => opprettSoknad()}
                        className="knapp knapp2"
                        size="small"
                        disabled={isEksisterendeSoknaderLoading}
                    >
                        {oppretterSoknad ? <Loader /> : <FormattedMessage id="ident.knapp.nyregistrering" />}
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapStateToProps = (state: RootStateType): IEksisterendeOMPAOSoknaderStateProps => ({
    identState: state.identState,
});

export const OMPAORegistreringsValg = connect(mapStateToProps)(RegistreringsValgComponent);
