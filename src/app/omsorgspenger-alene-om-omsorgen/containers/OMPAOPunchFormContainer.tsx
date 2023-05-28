/* eslint-disable no-template-curly-in-string */
import { Formik, yupToFormErrors } from 'formik';
import React, { useContext, useState } from 'react';
import { WrappedComponentProps, injectIntl, useIntl } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { IPeriode, Periode } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import intlHelper from 'app/utils/intlUtils';

import { hentEksisterendePerioder, hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema from '../schema';
import { OMPAOPunchForm } from './OMPAOPunchForm';

interface OwnProps {
    journalpostid: string;
}
export interface IPunchOMPAOFormStateProps {
    identState: IIdentState;
}

type IPunchOMPAOFormProps = OwnProps & WrappedComponentProps & IPunchOMPAOFormStateProps;

const OMPAOPunchFormContainer = (props: IPunchOMPAOFormProps) => {
    const { identState } = props;
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [eksisterendePerioder, setEksisterendePerioder] = useState<Periode[]>([]);
    const routingPaths = useContext(RoutingPathsContext);
    const dispatch = useDispatch();

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
        onSuccess: () => {
            history.push(`${routingPaths.kvittering}${id}`);
        },
    });

    const intl = useIntl();

    const handleStartButtonClick = () => {
        history.push('/');
    };

    if (isLoading) {
        return <Loader size="large" />;
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
            initialValues={initialValues(soeknadRespons)}
            validate={(values) =>
                schema
                    .validate(
                        { ...values },
                        {
                            abortEarly: false,
                        },
                    )
                    .then(() => ({}))
                    .catch((err) => yupToFormErrors(err))
            }
            onSubmit={() => submit()}
        >
            <OMPAOPunchForm
                visForhaandsvisModal={visForhaandsvisModal}
                setVisForhaandsvisModal={setVisForhaandsvisModal}
                k9FormatErrors={k9FormatErrors}
                eksisterendePerioder={eksisterendePerioder}
                setK9FormatErrors={setK9FormatErrors}
                submitError={submitError}
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPAOFormStateProps> => ({
    identState: state.identState,
});

export default injectIntl(connect(mapStateToProps)(OMPAOPunchFormContainer));
