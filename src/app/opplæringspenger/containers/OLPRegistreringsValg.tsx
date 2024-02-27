import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';
import { EksisterendeOLPSoknader } from './EksisterendeOLPSoknader';

export interface IOLPRegistreringsValgComponentProps {
    journalpostid: string;
}
export interface IEksisterendeOLPSoknaderStateProps {
    identState: IIdentState;
}

type IOLPRegistreringsValgProps = IOLPRegistreringsValgComponentProps & IEksisterendeOLPSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOLPRegistreringsValgProps> = (
    props: IOLPRegistreringsValgProps,
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
    } = useMutation(() => api.opprettSoeknad(journalpostid, søkerId, pleietrengendeId), {
        onSuccess: (soeknad) => {
            navigate(`../${ROUTES.PUNCH.replace(':id', soeknad?.soeknadId)}`);
        },
    });

    const { data: eksisterendeSoeknader } = useQuery('hentSoeknaderOLP', () => hentEksisterendeSoeknader(søkerId));

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
            <EksisterendeOLPSoknader søkerId={søkerId} pleietrengendeId={pleietrengendeId} />

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
                    <Button
                        loading={oppretterSoknad}
                        onClick={() => opprettSoknad()}
                        className="knapp knapp2"
                        size="small"
                    >
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapStateToProps = (state: RootStateType): IEksisterendeOLPSoknaderStateProps => ({
    identState: state.identState,
});

export const OLPRegistreringsValg = connect(mapStateToProps)(RegistreringsValgComponent);
