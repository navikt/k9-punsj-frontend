import React, { useEffect, useState } from 'react';

import { Alert, Button, Loader } from '@navikt/ds-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Formik, yupToFormErrors } from 'formik';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import { ROUTES } from 'app/constants/routes';
import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { trackOmpaoStartedFromJournalpost, trackOmpaoSubmitFromJournalpost } from 'app/utils/faroEvents';
import { Dispatch } from 'redux';
import { hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema from '../schema';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import OMPAOPunchForm from './OMPAOPunchForm';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';

interface Props {
    journalpostid: string;
}

const OMPAOPunchFormContainer = (props: Props) => {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const identState = useSelector((state: RootStateType) => state.identState);

    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [kvittering, setKvittering] = useState<IOMPAOSoknadKvittering | undefined>(undefined);
    const [erSendtInn, setErSendtInn] = useState(false);

    if (!id) {
        throw Error('Mangler id');
    }

    const {
        data: soeknadRespons,
        isPending,
        error,
    } = useQuery({
        queryKey: [id],
        queryFn: () => hentSoeknad(identState.søkerId, id),
    });

    useEffect(() => {
        if (soeknadRespons) {
            dispatch(setIdentFellesAction(soeknadRespons.soekerId, soeknadRespons.barn.norskIdent));
        }
    }, [soeknadRespons, dispatch]);

    useEffect(() => {
        trackOmpaoStartedFromJournalpost(props.journalpostid);
    }, [props.journalpostid]);

    useEffect(() => {
        if (erSendtInn && kvittering) {
            trackOmpaoSubmitFromJournalpost(props.journalpostid, kvittering);
        }
    }, [erSendtInn, kvittering, props.journalpostid]);

    const { error: submitError, mutate: submit } = useMutation({
        mutationFn: () => sendSoeknad(id, identState.søkerId),
        onSuccess: (data) => {
            if ('søknadId' in data) {
                setKvittering(data as IOMPAOSoknadKvittering);
                setErSendtInn(true);
            }
        },
    });

    const handleStartButtonClick = () => {
        dispatch(resetAllStateAction());
        navigate(ROUTES.HOME);
    };

    if (kvittering && erSendtInn) {
        return <KvitteringContainer kvittering={kvittering} />;
    }

    if (isPending) {
        return <Loader size="large" />;
    }

    if (error || !soeknadRespons) {
        return (
            <>
                <Alert size="small" variant="error">
                    <FormattedMessage id={'skjema.feil.ikke_funnet'} values={{ id: id }} />
                </Alert>

                <p>
                    <Button variant="secondary" onClick={handleStartButtonClick}>
                        <FormattedMessage id={'skjema.knapp.tilstart'} values={{ id: id }} />
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

export default OMPAOPunchFormContainer;
