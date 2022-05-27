/* eslint-disable no-template-curly-in-string */
import React, { useState } from 'react';
import { Formik } from 'formik';
import { connect } from 'react-redux';
import { injectIntl, useIntl, WrappedComponentProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { RootStateType } from 'app/state/RootState';
import { PunchStep } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { IIdentState } from 'app/models/types/IdentState';
import { useMutation, useQuery } from 'react-query';
import { Feil } from 'app/models/types/ValideringResponse';
import { useParams } from 'react-router';
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
    journalpostid: string;
    match: any;
}
export interface IPunchOMPUTFormStateProps {
    identState: IIdentState;
}

type IPunchOMPUTFormProps = OwnProps & WrappedComponentProps & IPunchOMPUTFormStateProps;

const OMPUTPunchFormContainer = (props: IPunchOMPUTFormProps) => {
    const { identState } = props;
    const { id } = useParams();

    const intl = useIntl();

    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const { data: soeknadRespons, isLoading, error } = useQuery(id, () => hentSoeknad(identState.ident1, id));
    const { error: submitError, mutate: submit } = useMutation(
        (soeknad: IOMPUTSoknad) => sendSoeknad(soeknad, identState.ident1),
        {
            onSuccess: () => {
                throw Error('legg inn url for kvittering');
                setHash('kvittering');
            },
        }
    );

    const handleSubmit = (soknad: IOMPUTSoknad) => {
        submit(soknad);
    };

    const handleStartButtonClick = () => {
        setHash('/');
    };

    if (isLoading) {
        return <NavFrontendSpinner />;
    }

    if (error) {
        return (
            <>
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_funnet', { id })}</AlertStripeFeil>
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

export default injectIntl(connect(mapStateToProps)(OMPUTPunchFormContainer));
