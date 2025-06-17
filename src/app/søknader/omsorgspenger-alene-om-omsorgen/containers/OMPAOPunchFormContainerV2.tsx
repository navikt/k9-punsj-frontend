import React, { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { Dispatch } from 'redux';

import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import { hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import OMPAOPunchFormV2 from './OMPAOPunchFormV2';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';
import { getTypedFormComponents } from '../../../components/form/getTypedFormComponents';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import { useForm } from 'react-hook-form';

const { TypedFormProvider } = getTypedFormComponents<IOMPAOSoknad>();
interface Props {
    journalpostid: string;
}

const OMPAOPunchFormContainerV2 = (props: Props) => {
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

    const { error: submitError, mutate: submit } = useMutation({
        mutationFn: () => sendSoeknad(id, identState.søkerId),
        onSuccess: (data) => {
            if ('søknadId' in data) {
                setKvittering(data as IOMPAOSoknadKvittering);
                setErSendtInn(true);
            }
        },
    });

    const methods = useForm<IOMPAOSoknad>({
        defaultValues: soeknadRespons ? initialValues(soeknadRespons) : undefined,
    });

    const handleFormSubmit = () => submit();

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
                    <FormattedMessage id={'skjema.feil.ikke_funnet'} values={{ id }} />
                </Alert>

                <p>
                    <Button variant="secondary" onClick={handleStartButtonClick}>
                        <FormattedMessage id={'skjema.knapp.tilstart'} values={{ id }} />
                    </Button>
                </p>
            </>
        );
    }
    return (
        <TypedFormProvider form={methods} onSubmit={handleFormSubmit}>
            <OMPAOPunchFormV2
                visForhaandsvisModal={visForhaandsvisModal}
                setVisForhaandsvisModal={setVisForhaandsvisModal}
                k9FormatErrors={k9FormatErrors}
                setK9FormatErrors={setK9FormatErrors}
                submitError={submitError}
                setKvittering={setKvittering}
                kvittering={kvittering}
                {...props}
            />
        </TypedFormProvider>
    );
};

export default OMPAOPunchFormContainerV2;
