import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useMutation, useQuery } from 'react-query';
import { Loader } from '@navikt/ds-react';
import { PunchStep } from '../../models/enums';
import { IIdentState } from '../../models/types/IdentState';
import { IPunchState } from '../../models/types';
import { setHash } from '../../utils';
import { EksisterendeOMPUTSoknader } from './EksisterendeOMPUTSoknader';
import { RootStateType } from '../../state/RootState';
import api, { hentEksisterendeSoeknader } from '../api';

export interface IOMPUTRegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
    sakstype: string;
}
export interface IEksisterendeOMPUTSoknaderStateProps {
    punchState: IPunchState;
    identState: IIdentState;
}

type IOMPUTRegistreringsValgProps = IOMPUTRegistreringsValgComponentProps & IEksisterendeOMPUTSoknaderStateProps;

export const RegistreringsValgComponent: React.FunctionComponent<IOMPUTRegistreringsValgProps> = (
    props: IOMPUTRegistreringsValgProps
) => {
    const { journalpostid, identState, getPunchPath, sakstype } = props;
    const { ident1, ident2 } = identState;

    const {
        isLoading: oppretterSoknad,
        error: opprettSoknadError,
        mutate: opprettSoknad,
    } = useMutation(() => api.opprettSoeknad(journalpostid, ident1), {
        onSuccess: (soeknad) => {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: soeknad.soeknadId,
                })
            );
        },
    });

    const { data: eksisterendeSoeknader } = useQuery(sakstype, () => hentEksisterendeSoeknader(ident1));

    const redirectToPreviousStep = () => {
        setHash('/');
    };

    if (opprettSoknadError instanceof Error) {
        return <AlertStripeFeil>{opprettSoknadError.message}</AlertStripeFeil>;
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
                ident1={ident1}
                ident2={ident2}
                getPunchPath={getPunchPath}
                journalpostid={journalpostid}
                sakstype={sakstype}
            />

            <div className="knapperad">
                <Knapp className="knapp knapp1" onClick={redirectToPreviousStep} mini>
                    Tilbake
                </Knapp>
                {kanStarteNyRegistrering() && (
                    <Hovedknapp onClick={() => opprettSoknad()} className="knapp knapp2" mini>
                        {oppretterSoknad ? <Loader /> : <FormattedMessage id="ident.knapp.nyregistrering" />}
                    </Hovedknapp>
                )}
            </div>
        </div>
    );
};
const mapStateToProps = (state: RootStateType): IEksisterendeOMPUTSoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_UTBETALING.punchState,
    identState: state.identState,
});

export const OMPUTRegistreringsValg = connect(mapStateToProps)(RegistreringsValgComponent);
