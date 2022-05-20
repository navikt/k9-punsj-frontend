import { useState } from 'react';
import { PunchStep, TimeFormat } from 'app/models/enums';
import { IPunchState } from 'app/models/types';
import { IdentRules } from 'app/rules';
import {
    resetPunchAction,
    setIdentAction,
    setStepAction,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { datetime, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { useQuery, UseQueryResult } from 'react-query';
import { Loader } from '@navikt/ds-react';
import { ApiPath } from 'app/apiConfig';
import { eksisterendeSoeknaderQuery } from 'app/api/api';
import { IOMPUTSoknad, OMPUTSoknad } from '../types/OMPUTSoknad';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { IOMPUTSoknadSvar } from '../types/OMPUTSoknadSvar';

export interface IEksisterendeOMPUTSoknaderStateProps {
    punchState: IPunchState;
}

export interface IEksisterendeOMPUTSoknaderDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    resetPunchAction: typeof resetPunchAction;
}

export interface IEksisterendeOMPUTSoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
    getPunchPath: (step: PunchStep, values?: any) => string;
    apiPaths: {
        eksisterendeSoeknader: ApiPath;
    };
    sakstype: string;
}

type IEksisterendeOMPUTSoknaderProps = WrappedComponentProps &
    IEksisterendeOMPUTSoknaderComponentProps &
    IEksisterendeOMPUTSoknaderStateProps &
    IEksisterendeOMPUTSoknaderDispatchProps;

export const EksisterendeOMPUTSoknaderComponent: React.FunctionComponent<IEksisterendeOMPUTSoknaderProps> = (
    props: IEksisterendeOMPUTSoknaderProps
) => {
    const { intl, punchState, getPunchPath, ident1, ident2, apiPaths, sakstype } = props;

    const [valgtSoeknad, setValgtSoeknad] = useState<IOMPUTSoknad | undefined>(undefined);

    React.useEffect(() => {
        if (IdentRules.areIdentsValid(ident1, ident2)) {
            props.setIdentAction(ident1, ident2);
            props.setStepAction(PunchStep.CHOOSE_SOKNAD);
        } else {
            props.resetPunchAction();
            setHash('/');
        }
    }, [ident1, ident2]);

    const {
        data: eksisterendeSoeknader,
        isLoading: lasterSoeknader,
        error: eksisterendeSoeknaderError,
    }: UseQueryResult<IOMPUTSoknadSvar, Error> = useQuery({
        queryKey: ['eksisterendeSoknader_', sakstype],
        queryFn: () => eksisterendeSoeknaderQuery({ path: apiPaths.eksisterendeSoeknader, ident: ident1 }),
    });

    if (!ident1) {
        return null;
    }

    if (lasterSoeknader || punchState.step !== PunchStep.CHOOSE_SOKNAD) {
        return <Loader />;
    }

    if (eksisterendeSoeknaderError) {
        return <AlertStripeFeil>{eksisterendeSoeknaderError.message}</AlertStripeFeil>;
    }

    const gaaVidereMedSoeknad = (soknad: IOMPUTSoknad) => {
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((soknadInfo: IOMPUTSoknad) => {
            const søknad = new OMPUTSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.barn?.map((barn) => barn.norskIdent).join(', '),
                Array.from(søknad.journalposter).join(', '),

                <Knapp key={soknadId} mini onClick={() => setValgtSoeknad(soknadInfo)}>
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Knapp>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        // eslint-disable-next-line react/no-array-index-key
                        rowContent.map((v, i) => <td key={`${soknadId}_${i}`}>{v}</td>)
                    ) : (
                        <td colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </td>
                    )}
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    key={soknadId}
                    onRequestClose={() => setValgtSoeknad(undefined)}
                    contentLabel={soknadId}
                    isOpen={!!valgtSoeknad && soknadId === valgtSoeknad.soeknadId}
                    closeButton={false}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => gaaVidereMedSoeknad(valgtSoeknad)}
                        onClose={() => setValgtSoeknad(undefined)}
                        submitKnappText="mappe.lesemodus.knapp.velg"
                    />
                </ModalWrapper>
            );
        });

        return (
            <>
                <h2>{intlHelper(intl, 'tabell.overskrift')}</h2>
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                        <tr>
                            <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                            <th>{intlHelper(intl, 'tabell.barnetsfnrellerfdato')}</th>
                            <th>{intlHelper(intl, 'tabell.journalpostid')}</th>
                            <th>{intlHelper(intl, 'skjema.periode')}</th>
                            <th aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
                {modaler}
            </>
        );
    }

    if (eksisterendeSoeknader?.søknader && eksisterendeSoeknader.søknader.length) {
        return <>{showSoknader()}</>;
    }

    return (
        <AlertStripeInfo>
            {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                antallSokere: ident2 ? '2' : '1',
            })}
        </AlertStripeInfo>
    );
};

const mapStateToProps = (state: RootStateType): IEksisterendeOMPUTSoknaderStateProps => ({
    punchState: state.OMSORGSPENGER_UTBETALING.punchState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    resetPunchAction: () => dispatch(resetPunchAction()),
});

export const EksisterendeOMPUTSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeOMPUTSoknaderComponent)
);
