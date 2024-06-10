/* eslint-disable no-template-curly-in-string */
import { Formik, yupToFormErrors } from 'formik';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { IIdentState } from 'app/models/types/IdentState';
import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';

import { hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema from '../schema';
import OMPAOPunchForm from './OMPAOPunchForm';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';

interface OwnProps {
    journalpostid: string;
}
export interface IPunchOMPAOFormStateProps {
    identState: IIdentState;
}

type IPunchOMPAOFormProps = OwnProps & IPunchOMPAOFormStateProps;

const OMPAOPunchFormContainer = (props: IPunchOMPAOFormProps) => {
    const { identState } = props;
    const { id } = useParams<{ id: string }>();
    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [kvittering, setKvittering] = useState<IOMPAOSoknadKvittering | undefined>(undefined);
    const [erSendtInn, setErSendtInn] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    if (!id) {
        throw Error('Mangler id');
    }

    const {
        data: soeknadRespons,
        isLoading,
        error,
    } = useQuery(id, () => hentSoeknad(identState.søkerId, id), {
        onSuccess: (data) => {
            dispatch(setIdentFellesAction(data.soekerId, data.barn.norskIdent));
        },
    });
    const { error: submitError, mutate: submit } = useMutation(() => sendSoeknad(id, identState.søkerId), {
        onSuccess: (data) => {
            if ('søknadId' in data) {
                setKvittering(data);
                setErSendtInn(true);
            }
        },
    });

    const intl = useIntl();

    const handleStartButtonClick = () => {
        dispatch(resetAllStateAction());
        navigate(ROUTES.HOME);
    };

    if (kvittering && erSendtInn) {
        return <KvitteringContainer kvittering={kvittering} />;
    }

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
                setK9FormatErrors={setK9FormatErrors}
                submitError={submitError}
                setKvittering={setKvittering}
                kvittering={kvittering}
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPAOFormStateProps> => ({
    identState: state.identState,
});

export default connect(mapStateToProps)(OMPAOPunchFormContainer);
