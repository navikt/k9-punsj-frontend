/* eslint-disable no-template-curly-in-string */
import { Formik, yupToFormErrors } from 'formik';
import React, { useContext, useState } from 'react';
import { injectIntl, useIntl, WrappedComponentProps } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { Periode } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { Feil } from 'app/models/types/ValideringResponse';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { hentEksisterendePerioder, hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema, { getSchemaContext } from '../schema';
import { backendTilFrontendMapping } from '../utils';
import { OMPUTPunchForm } from './OMPUTPunchForm';

interface OwnProps {
    journalpostid: string;
}
export interface IPunchOMPUTFormStateProps {
    identState: IIdentState;
}

type IPunchOMPUTFormProps = OwnProps & WrappedComponentProps & IPunchOMPUTFormStateProps;

const OMPUTPunchFormContainer = (props: IPunchOMPUTFormProps) => {
    const { identState } = props;
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [eksisterendePerioder, setEksisterendePerioder] = useState<Periode[]>([]);
    const routingPaths = useContext(RoutingPathsContext);
    const dispatch = useDispatch();

    const { mutate: hentPerioderK9 } = useMutation((ident: string) => hentEksisterendePerioder(ident), {
        onSuccess: (data) => setEksisterendePerioder(data),
    });
    const {
        data: soeknadRespons,
        isLoading,
        error,
    } = useQuery(id, () => hentSoeknad(identState.ident1, id), {
        onSuccess: (data) => {
            dispatch(setIdentFellesAction(data.soekerId));
            hentPerioderK9(data.soekerId);
        },
    });
    const { error: submitError, mutate: submit } = useMutation(() => sendSoeknad(id, identState.ident1), {
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
            initialValues={initialValues(backendTilFrontendMapping(soeknadRespons))}
            validate={(values) =>
                schema
                    .validate(
                        { ...values },
                        {
                            abortEarly: false,
                            context: getSchemaContext(values, eksisterendePerioder),
                        }
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
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPUTFormStateProps> => ({
    identState: state.identState,
});

export default injectIntl(connect(mapStateToProps)(OMPUTPunchFormContainer));
