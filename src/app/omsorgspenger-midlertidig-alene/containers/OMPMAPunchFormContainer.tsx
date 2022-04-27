/* eslint-disable no-template-curly-in-string */
import React, { useEffect } from 'react';
import { Formik, FormikValues } from 'formik';
import { connect } from 'react-redux';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { RootStateType } from 'app/state/RootState';
import { setHash } from 'app/utils';
import { PunchStep } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { setStepAction } from 'app/state/actions';
import { Personvalg } from 'app/models/types/IdentState';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { IPunchOMPMAFormStateProps, OMPMAPunchForm } from './OMPMAPunchForm';
import { getOMPMASoknad, resetPunchOMPMAFormAction, validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import schema from '../schema';

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
            barn: identState.barn.map((barn: Personvalg) => ({ norskIdent: barn.identitetsnummer })),
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
            validationSchema={schema}
            onSubmit={(values) => handleSubmit(values)}
        >
            {(formik) => <OMPMAPunchForm formik={formik} schema={schema} {...props} />}
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
