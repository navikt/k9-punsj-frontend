import React, { useEffect } from 'react';

import { Formik, FormikValues } from 'formik';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Loader } from '@navikt/ds-react';

import { Personvalg } from 'app/models/types/Personvalg';
import { RootStateType } from 'app/state/RootState';
import { hentBarn } from 'app/state/reducers/HentBarn';
import { getEnvironmentVariable } from 'app/utils';
import { useNavigate, useParams } from 'react-router';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import schema from '../schema';
import { getOMPMASoknad, validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import { OMPMAPunchForm } from './OMPMAPunchForm';
import OMPMASoknadKvittering from './SoknadKvittering/OMPMASoknadKvittering';
import { Dispatch } from 'redux';

const initialValues = (soknad: Partial<IOMPMASoknad> | undefined, barn: Personvalg[] | undefined) => ({
    soeknadId: soknad?.soeknadId || '',
    soekerId: soknad?.soekerId || '',
    mottattDato: soknad?.mottattDato || '',
    journalposter: soknad?.journalposter || new Set([]),
    klokkeslett: soknad?.klokkeslett || '',
    barn: soknad?.barn?.length ? soknad.barn : barn || [],
    annenForelder: {
        norskIdent: soknad?.annenForelder?.norskIdent || '',
        situasjonBeskrivelse: soknad?.annenForelder?.situasjonBeskrivelse || '',
        situasjonType: soknad?.annenForelder?.situasjonType || '',
        periode: {
            fom: soknad?.annenForelder?.periode?.fom || '',
            tom: soknad?.annenForelder?.periode?.tom || '',
            tilOgMedErIkkeOppgitt: false,
        },
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});

interface Props {
    journalpostid: string;
}

const OMPMAPunchFormContainer = (props: Props) => {
    const identState = useSelector((state: RootStateType) => state.identState);
    const punchFormState = useSelector((state: RootStateType) => state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState);
    const barn = useSelector((state: RootStateType) => state.felles.barn);
    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);

    const { soknad } = punchFormState;

    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch<any>>();

    useEffect(() => {
        if (!id) {
            dispatch(resetAllStateAction());
            navigate(ROUTES.HOME);
        }
    }, [id]);

    // for å fjerne warning om manglende id
    if (!id) {
        throw Error('Mangler id');
    }

    useEffect(() => {
        dispatch(getOMPMASoknad(id));
    }, [id]);

    useEffect(() => {
        if (soknad?.soekerId || identState.søkerId || journalpost?.norskIdent) {
            dispatch(hentBarn(soknad?.soekerId || identState.søkerId));
        }
    }, [soknad?.soekerId]);

    const handleSubmit = async (soknadFormik: FormikValues) => {
        dispatch(validerOMPMASoknad(soknadFormik as IOMPMASoknadUt, false));
    };

    const handleStartButtonClick = () => {
        dispatch(resetAllStateAction());
        navigate(ROUTES.HOME);
    };

    if (punchFormState.isComplete && punchFormState.innsentSoknad) {
        return (
            <>
                <Alert size="small" variant="info" className="fullfortmelding">
                    <FormattedMessage id="skjema.sentInn" />
                </Alert>

                <div className="punchPage__knapper mt-8">
                    <Button
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="tilbaketilLOS" />
                    </Button>
                </div>
                <OMPMASoknadKvittering response={punchFormState.innsentSoknad} />
            </>
        );
    }

    if (punchFormState.isSoknadLoading) {
        return <Loader size="large" />;
    }

    if (punchFormState.error) {
        return (
            <>
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.feil.ikke_funnet" values={{ id: id }} />
                </Alert>
                <p>
                    <Button variant="secondary" onClick={handleStartButtonClick}>
                        <FormattedMessage id="skjema.knapp.tilstart" />
                    </Button>
                </p>
            </>
        );
    }

    return (
        <Formik
            initialValues={initialValues(
                punchFormState.soknad,
                barn?.map((barnet) => ({
                    norskIdent: barnet.identitetsnummer,
                    navn: `${barnet.fornavn} ${barnet.etternavn}`,
                    låsIdentitetsnummer: true,
                })),
            )}
            validationSchema={schema}
            onSubmit={(values) => handleSubmit(values)}
        >
            {(formik) => <OMPMAPunchForm formik={formik} schema={schema} id={id} {...props} />}
        </Formik>
    );
};

export default OMPMAPunchFormContainer;
