/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-template-curly-in-string */
import React, { useEffect } from 'react';
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
import { hentBarn } from 'app/state/reducers/HentBarn';
import { IIdentState } from 'app/models/types/IdentState';
import { Personvalg } from 'app/models/types/Personvalg';
import { IBarn } from 'app/models/types/Barn';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { OMPMAPunchForm } from './OMPMAPunchForm';
import { getOMPMASoknad, resetPunchOMPMAFormAction, validerOMPMASoknad } from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import schema from '../schema';
import { IPunchOMPMAFormState } from '../types/PunchOMPMAFormState';

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
        },
    },
    harInfoSomIkkeKanPunsjes: soknad?.harInfoSomIkkeKanPunsjes || false,
    harMedisinskeOpplysninger: soknad?.harMedisinskeOpplysninger || false,
});

interface OwnProps {
    getPunchPath: (step: PunchStep, values?: any) => string;
    id: string;
    journalpostid: string;
    identState: IIdentState;
    barn?: IBarn[];
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

type IPunchOMPMAFormProps = OwnProps & WrappedComponentProps & IPunchOMPMAFormStateProps & IPunchOMPMAFormDispatchProps;

const OMPMAPunchFormContainer = (props: IPunchOMPMAFormProps) => {
    const { intl, getPunchPath, punchFormState, resetPunchFormAction, barn, henteBarn, identState } = props;
    const { soknad } = punchFormState;
    useEffect(() => {
        const { id } = props;
        props.getSoknad(id);
        props.setStepAction(PunchStep.FILL_FORM);
    }, []);

    useEffect(() => {
        if (soknad?.soekerId || identState.ident1) {
            henteBarn(soknad?.soekerId || identState.ident1);
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
            initialValues={initialValues(
                props.punchFormState.soknad,
                barn?.map((barnet) => ({
                    norskIdent: barnet.identitetsnummer,
                    navn: `${barnet.fornavn} ${barnet.etternavn}`,
                    låsIdentitetsnummer: true,
                }))
            )}
            validationSchema={schema}
            onSubmit={(values) => handleSubmit(values)}
        >
            {(formik) => <OMPMAPunchForm formik={formik} schema={schema} {...props} />}
        </Formik>
    );
};

const mapStateToProps = (state: RootStateType): Pick<OwnProps, 'identState' | 'barn'> & IPunchOMPMAFormStateProps => ({
    identState: state.identState,
    barn: state.felles.barn,
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
