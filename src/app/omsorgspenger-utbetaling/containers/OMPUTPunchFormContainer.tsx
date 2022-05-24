/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState } from 'react';
import { Formik, FormikValues } from 'formik';
import { connect } from 'react-redux';
import { WrappedComponentProps } from 'react-intl';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { RootStateType } from 'app/state/RootState';
import { setHash } from 'app/utils';
import { PunchStep } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { resetPunchFormAction as resetPunchAction, setStepAction } from 'app/state/actions';
import { IIdentState } from 'app/models/types/IdentState';
import { useMutation, useQuery } from 'react-query';
import { OMP_UT_API_PATHS } from 'app/apiConfig';
import { hentSoknadQuery, validerSoeknadMutation } from 'app/api/api';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { OMPUTPunchForm } from './OMPUTPunchForm';
import { getOMPUTSoknad, resetPunchOMPUTFormAction, validerOMPUTSoknad } from '../state/actions/OMPUTPunchFormActions';
import { IOMPUTSoknadUt } from '../types/OMPUTSoknadUt';
import schema from '../schema';
import { IPunchOMPUTFormState } from '../types/PunchOMPUTFormState';

const initialValues = (soknad: Partial<IOMPUTSoknad> | undefined) => ({
    soeknadId: soknad?.soeknadId || '',
    soekerId: soknad?.soekerId || '',
    mottattDato: soknad?.mottattDato || '',
    journalposter: soknad?.journalposter || new Set([]),
    klokkeslett: soknad?.klokkeslett || '',
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});

interface OwnProps {
    getPunchPath: (step: PunchStep, values?: any) => string;
    id: string;
    journalpostid: string;
}
export interface IPunchOMPUTFormStateProps {
    punchFormState: IPunchOMPUTFormState;
    identState: IIdentState;
}

export interface IPunchOMPUTFormDispatchProps {
    getSoknad: typeof getOMPUTSoknad;
    setStepAction: typeof setStepAction;
    validateSoknad: typeof validerOMPUTSoknad;
    resetPunchFormAction: typeof resetPunchAction;
}

type IPunchOMPUTFormProps = OwnProps & WrappedComponentProps & IPunchOMPUTFormStateProps & IPunchOMPUTFormDispatchProps;

const OMPUTPunchFormContainer = (props: IPunchOMPUTFormProps) => {
    const { intl, getPunchPath, punchFormState, resetPunchFormAction, identState, id } = props;

    useEffect(() => {
        props.setStepAction(PunchStep.FILL_FORM);
    }, []);

    const [soeknadIsValid, setSoeknadIsValid] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: id,
        queryFn: () => hentSoknadQuery({ path: OMP_UT_API_PATHS.hentSoeknad, ident: identState.ident1, soeknadId: id }),
    });

    const { mutate } = useMutation(
        (soeknad) =>
            validerSoeknadMutation({
                path: OMP_UT_API_PATHS.validerSoeknad,
                soeknad,
                ident: identState.ident1,
            }),
        {
            onSuccess: () => {
                setSoeknadIsValid(true);
            },
        }
    );

    const handleSubmit = async (soknad: FormikValues) => {
        mutate(soknad);
    };

    const handleStartButtonClick = () => {
        resetPunchFormAction();
        setHash('/');
    };

    if (punchFormState.isComplete) {
        setHash(getPunchPath(PunchStep.COMPLETED));
        return null;
    }

    if (isLoading) {
        return <NavFrontendSpinner />;
    }

    if (error) {
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
        <Formik initialValues={initialValues(data)} onSubmit={(values) => handleSubmit(values)}>
            {(formik) => <OMPUTPunchForm formik={formik} schema={schema} soeknadIsValid={soeknadIsValid} {...props} />}
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPUTFormStateProps> => ({
    identState: state.identState,
    punchFormState: state.OMSORGSPENGER_UTBETALING.punchFormState,
});

const mapDispatchToProps = (dispatch: any) => ({
    validateSoknad: (soknad: IOMPUTSoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPUTSoknad(soknad, erMellomlagring)),
    resetPunchFormAction: () => dispatch(resetPunchOMPUTFormAction()),
    getSoknad: (id: string) => dispatch(getOMPUTSoknad(id)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OMPUTPunchFormContainer);
