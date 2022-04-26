/* eslint-disable no-template-curly-in-string */
import React from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { connect } from 'react-redux';

import { erUgyldigIdent } from 'app/containers/pleiepenger/Fordeling/FordelingFeilmeldinger';
import { initializeDate } from 'app/utils/timeUtils';
import { RootStateType } from 'app/state/RootState';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { IPunchOMPMAFormStateProps, OMPMAPunchForm } from './OMPMAPunchForm';
import { validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
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
    const handleSubmit = async (soknad: IOMPMASoknad) => {
        const journalposter = {
            journalposter: Array.from(soknad && soknad.journalposter ? soknad?.journalposter : []),
        };

        props.validateSoknad({
            ...soknad,
            ...journalposter,
            barn: props.identState.barn.map((barn) => ({ norskIdent: barn.identitetsnummer })),
        });
    };
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
});

export default connect(mapStateToProps, mapDispatchToProps)(OMPMAPunchFormContainer);
