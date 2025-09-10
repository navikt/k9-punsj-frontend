import { Formik, yupToFormErrors } from 'formik';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
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

import { hentEksisterendePerioder, hentSoeknad, sendSoeknad } from '../api';
import { initialValues } from '../initialValues';
import schema, { getSchemaContext } from '../schema';
import { OLPPunchForm } from './OLPPunchForm';
import KvitteringContainer from './kvittering/KvitteringContainer';
import { IOLPSoknadKvittering } from '../OLPSoknadKvittering';

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

    const [kvittering, setKvittering] = useState<IOLPSoknadKvittering | undefined>(undefined);
    const [erSendtInn, setErSendtInn] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const intl = useIntl();

    const { mutate: hentPerioderK9, error: hentEksisterendePerioderError } = useMutation({
        mutationFn: ({ ident, barnIdent }: { ident: string; barnIdent: string }) =>
            hentEksisterendePerioder(ident, barnIdent),
        onSuccess: (data) => setEksisterendePerioder(data),
    });

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
            hentPerioderK9({
                ident: soeknadRespons.soekerId,
                barnIdent: soeknadRespons.barn?.norskIdent || identState.pleietrengendeId,
            });
        }
    }, [soeknadRespons, hentPerioderK9, identState.pleietrengendeId]);

    const { error: submitError, mutate: submit } = useMutation({
        mutationFn: () => sendSoeknad(id, identState.søkerId),
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

    if (isPending) {
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
                            context: getSchemaContext(eksisterendePerioder, values.metadata.harValgtAnnenInstitusjon),
                        },
                    )
                    .then(() => ({}))
                    .catch((err) => {
                        return yupToFormErrors(err);
                    })
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
                {...props}
            />
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOLPFormStateProps> => ({
    identState: state.identState,
});

export default connect(mapStateToProps)(OLPPunchFormContainer);
