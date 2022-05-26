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
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { OMPUTPunchForm } from './OMPUTPunchForm';
import { getOMPUTSoknad, resetPunchOMPUTFormAction, validerOMPUTSoknad } from '../state/actions/OMPUTPunchFormActions';
import { IOMPUTSoknadUt } from '../types/OMPUTSoknadUt';
import schema from '../schema';
import { IPunchOMPUTFormState } from '../types/PunchOMPUTFormState';
import { hentSoeknad, validerSoeknad } from '../api';

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

    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);

    useEffect(() => {
        props.setStepAction(PunchStep.FILL_FORM);
    }, []);

    const [soeknadIsValid, setSoeknadIsValid] = useState(false);

    const { data: soeknadRespons, isLoading, error } = useQuery(id, () => hentSoeknad(identState.ident1, id));

    const { data: soeknadTilForhaandsvisning, mutate: valider } = useMutation(
        (values: IOMPUTSoknad) => validerSoeknad(values, identState.ident1),
        {
            onSuccess: (data: ValideringResponse) => {
                if (!data?.feil?.length) setSoeknadIsValid(true);

                if (data?.feil?.length) setK9FormatErrors(data.feil);
            },
        }
    );

    const handleSubmit = (soknad: IOMPUTSoknad) => {
        valider(soknad);
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
        <Formik initialValues={initialValues(soeknadRespons)} onSubmit={(values: IOMPUTSoknad) => handleSubmit(values)}>
            {(formik) => (
                <OMPUTPunchForm
                    formik={formik}
                    schema={schema}
                    soeknadIsValid={soeknadIsValid}
                    soeknadTilForhaandsvisning={soeknadTilForhaandsvisning}
                    k9FormatErrors={k9FormatErrors}
                    setK9FormatErrors={setK9FormatErrors}
                    {...props}
                />
            )}
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
