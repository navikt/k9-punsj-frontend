import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { Dispatch } from 'redux';

import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import { defaultOMPAOSoknadValues, initialValues } from '../initialValues';
import OMPAOPunchFormV2 from './OMPAOPunchFormV2';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import KvitteringContainer from './SoknadKvittering/KvitteringContainer';
import { getTypedFormComponents } from '../../../components/form/getTypedFormComponents';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import { useForm } from 'react-hook-form';
import { OMPAOSoknadResolver } from '../OMPAOValidationSchema';
import { useOmpaoSoknad } from '../hooks/useOmpaoSoknad';

const { TypedFormProvider } = getTypedFormComponents<IOMPAOSoknad>();
interface Props {
    journalpostid: string;
}

const OMPAOPunchFormContainerV2 = (props: Props) => {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    const identState = useSelector((state: RootStateType) => state.identState);
    const [kvittering, setKvittering] = useState<IOMPAOSoknadKvittering | undefined>(undefined);

    if (!id) {
        throw Error('Mangler id');
    }

    const { soeknadRespons, isPending, error } = useOmpaoSoknad(id, identState.søkerId);

    const methods = useForm<IOMPAOSoknad>({
        resolver: OMPAOSoknadResolver,
        defaultValues: defaultOMPAOSoknadValues,
    });

    useEffect(() => {
        if (soeknadRespons) {
            dispatch(setIdentFellesAction(soeknadRespons.soekerId, soeknadRespons.barn.norskIdent));
        }
    }, [soeknadRespons, dispatch]);

    useEffect(() => {
        if (soeknadRespons) {
            methods.reset(initialValues(soeknadRespons));
        }
    }, [soeknadRespons, methods]);

    useEffect(() => {
        const currentJournalposter = methods.getValues('journalposter') || [];
        if (props.journalpostid && !currentJournalposter.includes(props.journalpostid)) {
            methods.setValue('journalposter', [...currentJournalposter, props.journalpostid]);
        }
    }, [props.journalpostid, methods]);

    const handleStartButtonClick = () => {
        dispatch(resetAllStateAction());
        navigate(ROUTES.HOME);
    };

    if (kvittering) {
        return <KvitteringContainer kvittering={kvittering} />;
    }

    if (isPending) {
        return <Loader size="large" />;
    }

    if (error || !soeknadRespons) {
        return (
            <>
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.feil.ikke_funnet" values={{ id }} />
                </Alert>

                <p>
                    <Button variant="secondary" onClick={handleStartButtonClick}>
                        <FormattedMessage id="skjema.knapp.tilstart" values={{ id }} />
                    </Button>
                </p>
            </>
        );
    }
    return (
        <TypedFormProvider form={methods} onSubmit={() => {}}>
            <OMPAOPunchFormV2 onSoknadSent={setKvittering} journalpostid={props.journalpostid} />
        </TypedFormProvider>
    );
};

export default OMPAOPunchFormContainerV2;
