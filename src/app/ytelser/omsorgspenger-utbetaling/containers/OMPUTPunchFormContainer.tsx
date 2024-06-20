import React, { useState } from 'react';
import { Formik, yupToFormErrors } from 'formik';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { IPeriode, Periode } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';

import { hentEksisterendePerioder, hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema, { getSchemaContext } from '../schema';
import { backendTilFrontendMapping } from '../utils';
import { OMPUTPunchForm } from './OMPUTPunchForm';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';
import { IOMPUTSoknadKvittering } from '../types/OMPUTSoknadKvittering';

interface OwnProps {
    journalpostid: string;
}
export interface IPunchOMPUTFormStateProps {
    identState: IIdentState;
}

type IPunchOMPUTFormProps = OwnProps & IPunchOMPUTFormStateProps;

const OMPUTPunchFormContainer = (props: IPunchOMPUTFormProps) => {
    const { identState } = props;
    const { id } = useParams<{ id: string }>();
    const intl = useIntl();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const [kvittering, setKvittering] = useState<IOMPUTSoknadKvittering | undefined>(undefined);

    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [eksisterendePerioder, setEksisterendePerioder] = useState<Periode[]>([]);
    const [erSendtInn, setErSendtInn] = useState(false);

    if (!id) {
        throw Error('Mangler id');
    }

    const { mutate: hentPerioderK9 } = useMutation(
        ({ soekerId, periode }: { soekerId: string; periode?: IPeriode }) =>
            hentEksisterendePerioder(soekerId, periode),
        {
            onSuccess: (data) => setEksisterendePerioder(data),
        },
    );
    const {
        data: soeknadRespons,
        isLoading,
        error,
    } = useQuery(id, () => hentSoeknad(identState.søkerId, id), {
        onSuccess: (data) => {
            dispatch(setIdentFellesAction(data.soekerId));
            hentPerioderK9({
                soekerId: data.soekerId,
                periode: fagsak?.gyldigPeriode || data.metadata?.eksisterendeFagsak?.gyldigPeriode,
            });
        },
    });
    const { error: submitError, mutate: submit } = useMutation(() => sendSoeknad(id, identState.søkerId), {
        onSuccess: (data) => {
            if ('søknadId' in data) {
                setErSendtInn(true);
            }
        },
    });

    const handleStartButtonClick = () => {
        dispatch(resetAllStateAction());
        navigate(ROUTES.HOME);
    };

    if (isLoading) {
        return <Loader size="large" />;
    }

    if (erSendtInn && kvittering) {
        return <KvitteringContainer kvittering={kvittering} />;
    }

    if (error || !soeknadRespons) {
        return (
            <>
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.feil.ikke_funnet', { id })}
                </Alert>
                <p>
                    <Button variant="secondary" onClick={handleStartButtonClick}>
                        {intlHelper(intl, 'skjema.knapp.tilstart')}
                    </Button>
                </p>
            </>
        );
    }
    return (
        <Formik
            initialValues={initialValues(backendTilFrontendMapping(soeknadRespons, fagsak))}
            validate={(values) =>
                schema
                    .validate(
                        { ...values },
                        {
                            abortEarly: false,
                            context: getSchemaContext(values, eksisterendePerioder),
                        },
                    )
                    .then(() => ({}))
                    .catch((err) => yupToFormErrors(err))
            }
            onSubmit={() => submit()}
        >
            <OMPUTPunchForm
                visForhaandsvisModal={visForhaandsvisModal}
                setVisForhaandsvisModal={setVisForhaandsvisModal}
                k9FormatErrors={k9FormatErrors}
                eksisterendePerioder={eksisterendePerioder}
                setK9FormatErrors={setK9FormatErrors}
                submitError={submitError}
                setKvittering={setKvittering}
                kvittering={kvittering}
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPUTFormStateProps> => ({
    identState: state.identState,
});

export default connect(mapStateToProps)(OMPUTPunchFormContainer);
