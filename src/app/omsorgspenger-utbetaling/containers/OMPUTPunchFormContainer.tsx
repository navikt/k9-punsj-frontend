/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
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
import { Feil } from 'app/models/types/ValideringResponse';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { OMPUTPunchForm } from './OMPUTPunchForm';
import schema from '../schema';
import { hentSoeknad, sendSoeknad } from '../api';

const initialValues = (soknad: Partial<IOMPUTSoknad> | undefined) => ({
    barn: soknad?.barn || [],
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
    identState: IIdentState;
}

export interface IPunchOMPUTFormDispatchProps {
    setStepAction: typeof setStepAction;
    resetPunchFormAction: typeof resetPunchAction;
}

type IPunchOMPUTFormProps = OwnProps & WrappedComponentProps & IPunchOMPUTFormStateProps & IPunchOMPUTFormDispatchProps;

const OMPUTPunchFormContainer = (props: IPunchOMPUTFormProps) => {
    const { intl, getPunchPath, resetPunchFormAction, identState, id } = props;

    useEffect(() => {
        props.setStepAction(PunchStep.FILL_FORM);
    }, []);

    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const { data: soeknadRespons, isLoading, error } = useQuery(id, () => hentSoeknad(identState.ident1, id));
    const { error: submitError, mutate: submit } = useMutation(
        (soeknad: IOMPUTSoknad) => sendSoeknad(soeknad, identState.ident1),
        {
            onSuccess: () => {
                setHash(getPunchPath(PunchStep.COMPLETED));
            },
        }
    );

    const handleSubmit = (soknad: IOMPUTSoknad) => {
        submit(soknad);
    };

    const handleStartButtonClick = () => {
        resetPunchFormAction();
        setHash('/');
    };

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
        <Formik initialValues={initialValues(soeknadRespons)} onSubmit={(values: IOMPUTSoknad) => handleSubmit(values)}>
            {(formik) => (
                <OMPUTPunchForm
                    formik={formik}
                    schema={schema}
                    visForhaandsvisModal={visForhaandsvisModal}
                    setVisForhaandsvisModal={setVisForhaandsvisModal}
                    k9FormatErrors={k9FormatErrors}
                    setK9FormatErrors={setK9FormatErrors}
                    submitError={submitError}
                    {...props}
                />
            )}
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Partial<IPunchOMPUTFormStateProps> => ({
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OMPUTPunchFormContainer);
