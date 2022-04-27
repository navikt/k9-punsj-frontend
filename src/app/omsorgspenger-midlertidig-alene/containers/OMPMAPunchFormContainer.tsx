/* eslint-disable no-template-curly-in-string */
import React, { useEffect } from 'react';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { connect } from 'react-redux';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { erUgyldigIdent } from 'app/containers/pleiepenger/Fordeling/FordelingFeilmeldinger';
import { initializeDate } from 'app/utils/timeUtils';
import { RootStateType } from 'app/state/RootState';
import { setHash } from 'app/utils';
import { PunchStep } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { setStepAction } from 'app/state/actions';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { IPunchOMPMAFormStateProps, OMPMAPunchForm } from './OMPMAPunchForm';
import { getOMPMASoknad, resetPunchOMPMAFormAction, validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';

function erIkkeFremITid(dato: string) {
    const naa = new Date();
    return naa > new Date(dato);
}

const klokkeslettErFremITid = (mottattDato?: string, klokkeslett?: string) => {
    const naa = new Date();
    if (mottattDato && klokkeslett && new Date(mottattDato).getDate() === naa.getDate()) {
        return initializeDate(naa).format('HH:mm') < klokkeslett;
    }
    return false;
};

const initialValues = (soknad: Partial<IOMPMASoknad> | undefined) => ({
    soeknadId: soknad?.soeknadId || '',
    soekerId: soknad?.soekerId || '',
    mottattDato: soknad?.mottattDato || '',
    journalposter: soknad?.journalposter || new Set([]),
    klokkeslett: soknad?.klokkeslett || '',
    annenForelder: {
        norskIdent: soknad?.annenForelder?.norskIdent || '',
        situasjonBeskrivelse: soknad?.annenForelder?.situasjonBeskrivelse || '',
        situasjonType: soknad?.annenForelder?.situasjonType || '',
        periode: {
            fom: soknad?.annenForelder?.periode?.fom || '',
            tom: soknad?.annenForelder?.periode?.tom || '',
        },
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});

const yupSchema = yup.object({
    mottattDato: yup
        .string()
        .required()
        .test({ test: erIkkeFremITid, message: 'Dato kan ikke være frem i tid' })
        .label('Mottatt dato'),
    klokkeslett: yup
        .string()
        .required()
        .when('mottattDato', (mottattDato, schema) =>
            schema.test({
                test: (klokkeslett: string) => !klokkeslettErFremITid(mottattDato, klokkeslett),
                message: 'Klokkeslett kan ikke være frem i tid',
            })
        )
        .label('Klokkeslett'),
    annenForelder: yup.object().shape({
        norskIdent: yup
            .string()
            .required()
            .nullable(true)
            .length(11)
            .test({
                test: (identifikasjonsnummer: string) => !erUgyldigIdent(identifikasjonsnummer),
                message: 'Ugyldig identifikasjonsnummer',
            })
            .label('Identifikasjonsnummer'),
        situasjonType: yup.string().required().nullable(true).label('Situasjonstype'),
        situasjonBeskrivelse: yup.string().required().min(5).nullable(true).label('Situasjonsbeskrivelse'),
        periode: yup.object().shape({
            fom: yup.string().required().label('Fra og med'),
            tom: yup.string().required().label('Til og med'),
        }),
    }),
});

yup.setLocale({
    mixed: {
        required: '${path} er et påkrevd felt.',
    },
    string: {
        min: '${path} må være minst ${min} tegn',
        max: '${path} må være mest ${max} tegn',
        length: '${path} må være nøyaktig ${length} tegn',
    },
});

const OMPMAPunchFormContainer = (props) => {
    const { intl, getPunchPath, punchFormState, resetPunchFormAction, identState } = props;

    useEffect(() => {
        const { id } = props;
        props.getSoknad(id);
        props.setStepAction(PunchStep.FILL_FORM);
    }, []);

    const handleSubmit = async (soknad: FormikValues) => {
        const journalposter = {
            journalposter: Array.from(soknad && soknad.journalposter ? soknad?.journalposter : []),
        };

        props.validateSoknad({
            ...soknad,
            ...journalposter,
            barn: identState.barn.map((barn) => ({ norskIdent: barn.identitetsnummer })),
        });
    };

    const handleStartButtonClick = () => {
        resetPunchFormAction();
        setHash('/');
    };

    if (punchFormState.isComplete) {
        setHash(getPunchPath(PunchStep.COMPLETED));
        return null;
    }

    if (punchFormState.isSoknadLoading) {
        return <NavFrontendSpinner />;
    }

    if (punchFormState.error) {
        return (
            <>
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_funnet', { id: props.id })}</AlertStripeFeil>
                <p>
                    <Knapp onClick={handleStartButtonClick}>{intlHelper(intl, 'skjema.knapp.tilstart')}</Knapp>
                </p>
            </>
        );
    }

    return (
        <Formik
            initialValues={initialValues(props.punchFormState.soknad)}
            validationSchema={yupSchema}
            onSubmit={(values) => handleSubmit(values)}
        >
            {(formik) => <OMPMAPunchForm formik={formik} schema={yupSchema} {...props} />}
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPMAFormStateProps> => ({
    identState: state.identState,
    punchFormState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState,
});

const mapDispatchToProps = (dispatch: any) => ({
    validateSoknad: (soknad: IOMPMASoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPMASoknad(soknad, erMellomlagring)),
    resetPunchFormAction: () => dispatch(resetPunchOMPMAFormAction()),
    getSoknad: (id: string) => dispatch(getOMPMASoknad(id)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OMPMAPunchFormContainer);
