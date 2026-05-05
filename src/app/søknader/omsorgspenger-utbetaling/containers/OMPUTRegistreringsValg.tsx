import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IJournalpost } from 'app/models/types';
import { manglerK9saksnummerMessage, resolveK9saksnummer } from 'app/utils/k9saksnummerUtils';

import { IFordelingState } from '../../../models/types/FordelingState';
import { IIdentState } from '../../../models/types/IdentState';
import { RootStateType } from '../../../state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';
import { EksisterendeOMPUTSoknader } from './EksisterendeOMPUTSoknader';

export interface IOMPUTRegistreringsValgComponentProps {
    journalpostid: string;
}
export interface IEksisterendeOMPUTSoknaderStateProps {
    identState: IIdentState;
    fordelingState: IFordelingState;
    journalpost?: IJournalpost;
}

type IOMPUTRegistreringsValgProps = IOMPUTRegistreringsValgComponentProps & IEksisterendeOMPUTSoknaderStateProps;

export const RegistreringsValgComponent: React.FC<IOMPUTRegistreringsValgProps> = (
    props: IOMPUTRegistreringsValgProps,
) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { journalpostid, identState, fordelingState, journalpost } = props;
    const { søkerId, pleietrengendeId } = identState;
    const k9saksnummer = resolveK9saksnummer(fordelingState, journalpost);

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
        mutationFn: () => {
            if (!k9saksnummer) {
                throw Error(manglerK9saksnummerMessage);
            }
            return api.opprettSoeknad(journalpostid, søkerId, k9saksnummer);
        },
        onSuccess: (soeknad) => {
            navigate(`../${ROUTES.PUNCH.replace(':id', soeknad.soeknadId)}`);
        },
    });

    const { data: eksisterendeSoeknader, isPending: isEksisterendeSoknaderLoading } = useQuery({
        queryKey: ['hentSoeknaderOMPUT'],
        queryFn: () => hentEksisterendeSoeknader(søkerId),
    });

    if (!journalpostid) {
        throw Error('Mangler journalpostid');
    }

    // Starte søknad automatisk hvis ingen søknader finnes
    useEffect(() => {
        const soknader = eksisterendeSoeknader?.søknader;
        if (soknader?.length === 0 && k9saksnummer) {
            opprettSoknad();
        }
    }, [eksisterendeSoeknader?.søknader, k9saksnummer, opprettSoknad]);

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
                Array.from(soknad?.journalposter || []).some((jpId) => jpId === journalpostid),
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeOMPUTSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
                kanStarteNyRegistrering={kanStarteNyRegistrering()}
            />
            {!k9saksnummer && (
                <Alert size="small" variant="warning">
                    {manglerK9saksnummerMessage}
                </Alert>
            )}

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
                        disabled={isEksisterendeSoknaderLoading || !k9saksnummer}
                    >
                        {oppretterSoknad ? <Loader /> : <FormattedMessage id="ident.knapp.nyregistrering" />}
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapStateToProps = (state: RootStateType): IEksisterendeOMPUTSoknaderStateProps => ({
    identState: state.identState,
    fordelingState: state.fordelingState,
    journalpost: state.felles.journalpost,
});

export const OMPUTRegistreringsValg = connect(mapStateToProps)(RegistreringsValgComponent);
