import { Alert, Button, Loader } from '@navikt/ds-react';

import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useMutation, useQuery } from 'react-query';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import { IIdentState } from '../../models/types/IdentState';
import { setHash } from '../../utils';
import { EksisterendeOMPUTSoknader } from './EksisterendeOMPUTSoknader';
import { RootStateType } from '../../state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';

export interface IOMPUTRegistreringsValgComponentProps {
    journalpostid: string;
}
export interface IEksisterendeOMPUTSoknaderStateProps {
    identState: IIdentState;
}

type IOMPUTRegistreringsValgProps = IOMPUTRegistreringsValgComponentProps & IEksisterendeOMPUTSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPUTRegistreringsValgProps> = (
    props: IOMPUTRegistreringsValgProps
) => {
    const { journalpostid, identState } = props;
    const routingPaths = useContext(RoutingPathsContext);
    const { søkerId, pleietrengendeId } = identState;

    const {
        isLoading: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation(() => api.opprettSoeknad(journalpostid, søkerId), {
        onSuccess: (soeknad) => {
            setHash(`${routingPaths.skjema}${soeknad.soeknadId}`);
        },
    });

    const { data: eksisterendeSoeknader } = useQuery('hentSoeknaderOMPUT', () => hentEksisterendeSoeknader(søkerId));

    const redirectToPreviousStep = () => {
        setHash('/');
    };

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
                Array.from(soknad?.journalposter || []).some((journalpost) => journalpost === journalpostid)
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeOMPUTSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
                journalpostid={journalpostid}
            />

            <div className="knapperad">
                <Button variant="secondary" className="knapp knapp1" onClick={redirectToPreviousStep} size="small">
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
