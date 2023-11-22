import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect } from 'react-redux';

import { Alert, Button } from '@navikt/ds-react';

import RoutingPathsContext from 'app/state/context/RoutingPathsContext';

import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { setHash } from '../../utils';
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
    const { journalpostid, identState } = props;
    const routingPaths = useContext(RoutingPathsContext);
    const { søkerId, pleietrengendeId } = identState;
    const navigate = useNavigate();

    const {
        isLoading: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation(() => api.opprettSoeknad(journalpostid, søkerId, pleietrengendeId), {
        onSuccess: (soeknad) => {
            setHash(`${routingPaths.skjema}${soeknad.soeknadId}`);
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
            <EksisterendeOLPSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
                journalpostid={journalpostid}
            />

            <div className="knapperad">
                <Button variant="secondary" className="knapp knapp1" onClick={() => navigate(-1)} size="small">
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
