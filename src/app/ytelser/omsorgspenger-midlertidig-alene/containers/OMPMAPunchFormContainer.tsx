import React, { useEffect } from 'react';
import { Formik, FormikValues } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { IBarn } from 'app/models/types/Barn';
import { IIdentState } from 'app/models/types/IdentState';
import { Personvalg } from 'app/models/types/Personvalg';
import { RootStateType } from 'app/state/RootState';
import { hentBarn } from 'app/state/reducers/HentBarn';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { useNavigate, useParams } from 'react-router';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';

import schema from '../schema';
import { getOMPMASoknad, validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import { IPunchOMPMAFormState } from '../types/PunchOMPMAFormState';
import { OMPMAPunchForm } from './OMPMAPunchForm';
import OMPMASoknadKvittering from './SoknadKvittering/OMPMASoknadKvittering';

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

interface OwnProps {
    journalpostid: string;
    identState: IIdentState;
    barn?: IBarn[];
    harHentBarnResponse: boolean | undefined;
}
export interface IPunchOMPMAFormStateProps {
    punchFormState: IPunchOMPMAFormState;
}

export interface IPunchOMPMAFormDispatchProps {
    getSoknad: typeof getOMPMASoknad;
    validateSoknad: typeof validerOMPMASoknad;
    henteBarn: typeof hentBarn;
}

type IPunchOMPMAFormProps = OwnProps & IPunchOMPMAFormStateProps & IPunchOMPMAFormDispatchProps;

const OMPMAPunchFormContainer = (props: IPunchOMPMAFormProps) => {
    const { punchFormState, barn, henteBarn, identState } = props;
    const intl = useIntl();
    const { soknad } = punchFormState;
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!id || !identState.søkerId) {
            dispatch(resetAllStateAction());
            navigate(ROUTES.HOME);
        }
    }, [id, identState.søkerId]);

    // for å fjerne warning om manglende id
    if (!id) {
        throw Error('Mangler id');
    }

    useEffect(() => {
        props.getSoknad(id);
    }, [id]);

    useEffect(() => {
        if (soknad?.soekerId || identState.søkerId) {
            henteBarn(soknad?.soekerId || identState.søkerId);
        }
    }, [soknad?.soekerId]);

    const handleSubmit = async (values: Partial<IOMPMASoknad>) => {
        props.validateSoknad({
            ...values,
        });
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
                        {intlHelper(intl, 'tilbaketilLOS')}
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
            initialValues={initialValues(
                props.punchFormState.soknad,
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

const mapStateToProps = (
    state: RootStateType,
): Pick<OwnProps, 'identState' | 'barn' | 'harHentBarnResponse'> & IPunchOMPMAFormStateProps => ({
    identState: state.identState,
    barn: state.felles.barn,
    harHentBarnResponse: state.felles.harHentBarnResponse,
    punchFormState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState,
});

const mapDispatchToProps = (dispatch: any) => ({
    validateSoknad: (soknad: IOMPMASoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPMASoknad(soknad, erMellomlagring)),
    getSoknad: (id: string) => dispatch(getOMPMASoknad(id)),
    henteBarn: (sokersIdent: string) => dispatch(hentBarn(sokersIdent)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OMPMAPunchFormContainer);
