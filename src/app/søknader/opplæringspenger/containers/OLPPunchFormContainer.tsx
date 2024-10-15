import { Formik, yupToFormErrors } from 'formik';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from 'react-query';
import { connect, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { Periode } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { Feil } from 'app/models/types/ValideringResponse';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';

import { hentEksisterendePerioder, hentInstitusjoner, hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema, { getSchemaContext } from '../schema';
import { OLPPunchForm } from './OLPPunchForm';
import KvitteringContainer from './kvittering/KvitteringContainer';
import { IOLPSoknadKvittering } from '../OLPSoknadKvittering';
import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';

interface OwnProps {
    journalpostid: string;
}
export interface IPunchOLPFormStateProps {
    identState: IIdentState;
}

type IPunchOLPFormProps = OwnProps & IPunchOLPFormStateProps;

const OLPPunchFormContainer = (props: IPunchOLPFormProps) => {
    const { identState } = props;
    const { id } = useParams<{ id: string }>();
    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [eksisterendePerioder, setEksisterendePerioder] = useState<Periode[]>([]);
    const [institusjoner, setInstitusjoner] = useState<GodkjentOpplæringsinstitusjon[]>([]);
    const [kvittering, setKvittering] = useState<IOLPSoknadKvittering | undefined>(undefined);
    const [erSendtInn, setErSendtInn] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const intl = useIntl();

    const { mutate: hentPerioderK9, error: hentEksisterendePerioderError } = useMutation(
        (ident: string) => hentEksisterendePerioder(ident),
        {
            onSuccess: (data) => setEksisterendePerioder(data),
        },
    );

    const {
        mutate: hentInstitusjonerK9,
        error: hentInstitusjonerError,
        isLoading: hentInstitusjonerLoading,
    } = useMutation(() => hentInstitusjoner(), {
        onSuccess: (data) => setInstitusjoner(data),
    });

    if (!id) {
        throw Error('Mangler id');
    }
    const {
        data: soeknadRespons,
        isLoading,
        error,
    } = useQuery(id, () => hentSoeknad(identState.søkerId, id), {
        onSuccess: (data) => {
            hentPerioderK9(data.soekerId);
            hentInstitusjonerK9();
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

    if (erSendtInn && kvittering) {
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
                setKvittering={setKvittering}
                kvittering={kvittering}
                institusjoner={institusjoner}
                hentInstitusjonerLoading={!!hentInstitusjonerLoading}
                hentInstitusjonerError={!!hentInstitusjonerError}
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOLPFormStateProps> => ({
    identState: state.identState,
});

export default connect(mapStateToProps)(OLPPunchFormContainer);
