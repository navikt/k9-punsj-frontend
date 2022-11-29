import { Alert, Button } from '@navikt/ds-react';

import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useMutation, useQuery } from 'react-query';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import { IIdentState } from '../../models/types/IdentState';
import { setHash } from '../../utils';
import { EksisterendeOLPSoknader } from './EksisterendeOLPSoknader';
import { RootStateType } from '../../state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';

export interface IOLPRegistreringsValgComponentProps {
    journalpostid: string;
}
export interface IEksisterendeOLPSoknaderStateProps {
    identState: IIdentState;
}

type IOLPRegistreringsValgProps = IOLPRegistreringsValgComponentProps & IEksisterendeOLPSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOLPRegistreringsValgProps> = (
    props: IOLPRegistreringsValgProps
) => {
    const { journalpostid, identState } = props;
    const routingPaths = useContext(RoutingPathsContext);
    const { ident1, ident2 } = identState;

    const {
        isLoading: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation(() => api.opprettSoeknad(journalpostid, ident1), {
        onSuccess: (soeknad) => {
            setHash(`${routingPaths.skjema}${soeknad.soeknadId}`);
        },
    });

    const { data: eksisterendeSoeknader } = useQuery('hentSoeknaderOLP', () => hentEksisterendeSoeknader(ident1));

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
            <EksisterendeOLPSoknader ident1={ident1} ident2={ident2} journalpostid={journalpostid} />

            <div className="knapperad">
                <Button variant="secondary" className="knapp knapp1" onClick={redirectToPreviousStep} size="small">
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
