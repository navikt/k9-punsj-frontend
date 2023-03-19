/* eslint-disable no-template-curly-in-string */
import { Formik, yupToFormErrors } from 'formik';
import React, { useContext, useState } from 'react';
import { WrappedComponentProps, injectIntl, useIntl } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { Periode } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import intlHelper from 'app/utils/intlUtils';

import { hentEksisterendePerioder, hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema, { getSchemaContext } from '../schema';
import { OLPPunchForm } from './OLPPunchForm';

interface OwnProps {
    journalpostid: string;
}
export interface IPunchOLPFormStateProps {
    identState: IIdentState;
}

type IPunchOLPFormProps = OwnProps & WrappedComponentProps & IPunchOLPFormStateProps;

const OLPPunchFormContainer = (props: IPunchOLPFormProps) => {
    const { identState } = props;
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [eksisterendePerioder, setEksisterendePerioder] = useState<Periode[]>([]);
    const routingPaths = useContext(RoutingPathsContext);

    const { mutate: hentPerioderK9, error: hentEksisterendePerioderError } = useMutation(
        (ident: string) => hentEksisterendePerioder(ident),
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
            hentPerioderK9(data.soekerId);
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
                            context: getSchemaContext(values, eksisterendePerioder),
                        },
                    )
                    .then(() => ({}))
                    .catch((err) => yupToFormErrors(err))
            }
            onSubmit={() => submit()}
        >
            <OLPPunchForm
                visForhaandsvisModal={visForhaandsvisModal}
                setVisForhaandsvisModal={setVisForhaandsvisModal}
                k9FormatErrors={k9FormatErrors}
                eksisterendePerioder={eksisterendePerioder}
                setK9FormatErrors={setK9FormatErrors}
                submitError={submitError}
                hentEksisterendePerioderError={!!hentEksisterendePerioderError}
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOLPFormStateProps> => ({
    identState: state.identState,
});

export default injectIntl(connect(mapStateToProps)(OLPPunchFormContainer));
