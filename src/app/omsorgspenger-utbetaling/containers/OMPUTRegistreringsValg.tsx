import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';
import { EksisterendeOMPUTSoknader } from './EksisterendeOMPUTSoknader';

export interface IOMPUTRegistreringsValgComponentProps {
    journalpostid: string;
}
export interface IEksisterendeOMPUTSoknaderStateProps {
    identState: IIdentState;
}

type IOMPUTRegistreringsValgProps = IOMPUTRegistreringsValgComponentProps & IEksisterendeOMPUTSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPUTRegistreringsValgProps> = (
    props: IOMPUTRegistreringsValgProps,
) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { journalpostid, identState } = props;
    const { søkerId, pleietrengendeId } = identState;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId) {
            navigate(location.pathname.replace('soknader', ''));
        }
    }, []);

    const {
        isLoading: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation(() => api.opprettSoeknad(journalpostid, søkerId), {
        onSuccess: (soeknad) => {
            navigate(`../${ROUTES.PUNCH.replace(':id', soeknad.soeknadId)}`);
        },
    });

    const { data: eksisterendeSoeknader } = useQuery('hentSoeknaderOMPUT', () => hentEksisterendeSoeknader(søkerId));

    if (!journalpostid) {
        throw Error('Mangler journalpostid');
    }

    if (opprettSoknadError instanceof Error) {
        return (
            <Alert size="small" variant="error">
                {opprettSoknadError.message}
            </Alert>
        );
    }

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoeknader?.søknader;
        if (soknader?.length) {
            return !soknader?.some((soknad) =>
                Array.from(soknad?.journalposter || []).some((journalpost) => journalpost === journalpostid),
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeOMPUTSoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} />

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
                    <Button onClick={() => opprettSoknad()} className="knapp knapp2" size="small">
                        {oppretterSoknad ? <Loader /> : <FormattedMessage id="ident.knapp.nyregistrering" />}
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapStateToProps = (state: RootStateType): IEksisterendeOMPUTSoknaderStateProps => ({
    identState: state.identState,
});

export const OMPUTRegistreringsValg = connect(mapStateToProps)(RegistreringsValgComponent);
