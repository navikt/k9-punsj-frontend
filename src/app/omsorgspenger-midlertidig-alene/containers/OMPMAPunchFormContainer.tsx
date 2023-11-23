/* eslint-disable @typescript-eslint/no-shadow */

/* eslint-disable no-template-curly-in-string */
import { Formik, FormikValues } from 'formik';
import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';

import { Alert, Button, Loader } from '@navikt/ds-react';

import { PunchStep } from 'app/models/enums';
import { IBarn } from 'app/models/types/Barn';
import { IIdentState } from 'app/models/types/IdentState';
import { Personvalg } from 'app/models/types/Personvalg';
import { RootStateType } from 'app/state/RootState';
import { resetPunchFormAction as resetPunchAction, setStepAction } from 'app/state/actions';
import { hentBarn } from 'app/state/reducers/HentBarn';
import { getEnvironmentVariable, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { useNavigate, useParams } from 'react-router';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';

import schema from '../schema';
import { getOMPMASoknad, resetPunchOMPMAFormAction, validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
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
    setStepAction: typeof setStepAction;
    validateSoknad: typeof validerOMPMASoknad;
    resetPunchFormAction: typeof resetPunchAction;
    henteBarn: typeof hentBarn;
}

type IPunchOMPMAFormProps = OwnProps & IPunchOMPMAFormStateProps & IPunchOMPMAFormDispatchProps;

const OMPMAPunchFormContainer = (props: IPunchOMPMAFormProps) => {
    const { punchFormState, resetPunchFormAction, barn, henteBarn, identState, harHentBarnResponse } = props;
    const intl = useIntl();
    const { soknad } = punchFormState;
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!id) {
            dispatch(resetAllStateAction());
            navigate(ROUTES.HOME);
        }
    });
    useEffect(() => {
        props.getSoknad(id);
    }, [id]);

    useEffect(() => {
        if (soknad?.soekerId || identState.søkerId) {
            henteBarn(soknad?.soekerId || identState.søkerId);
        }
    }, [soknad?.soekerId]);

    const handleSubmit = async (soknad: FormikValues) => {
        props.validateSoknad({
            ...soknad,
        });
    };

    const handleStartButtonClick = () => {
        resetPunchFormAction();
        setHash('/');
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

    if (punchFormState.isSoknadLoading || !harHentBarnResponse) {
        return <Loader size="large" />;
    }

    if (punchFormState.error) {
        return (
            <>
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.feil.ikke_funnet', { id: props.id })}
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
    resetPunchFormAction: () => dispatch(resetPunchOMPMAFormAction()),
    getSoknad: (id: string) => dispatch(getOMPMASoknad(id)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    henteBarn: (sokersIdent: string) => dispatch(hentBarn(sokersIdent)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OMPMAPunchFormContainer);
