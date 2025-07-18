import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { connect, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IIdentState } from '../../../models/types/IdentState';
import { RootStateType } from '../../../state/RootState';
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

    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const k9saksnummer = fordelingState.fagsak?.fagsakId;

    // Redirect tilbake ved side reload
    useEffect(() => {
        if (!søkerId) {
            navigate(location.pathname.replace('soknader/', ''));
        }
    }, [søkerId, location.pathname, navigate]);

    const {
        isPending: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation({
        mutationFn: () => api.opprettSoeknad(journalpostid, søkerId, pleietrengendeId, k9saksnummer),
        onSuccess: (soeknad) => {
            navigate(`../${ROUTES.PUNCH.replace(':id', soeknad?.soeknadId)}`);
        },
    });

    const { data: eksisterendeSoeknader, isPending: isEksisterendeSoknaderLoading } = useQuery({
        queryKey: ['hentSoeknaderOLP'],
        queryFn: () => hentEksisterendeSoeknader(søkerId),
    });

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        const soknader = eksisterendeSoeknader?.søknader;
        if (soknader?.length === 0) {
            opprettSoknad();
        }
    }, [eksisterendeSoeknader?.søknader, opprettSoknad]);

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
                    onClick={() => navigate(location.pathname.replace('soknader/', ''))}
                    size="small"
                    disabled={isEksisterendeSoknaderLoading}
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
