import Personvelger, { PersonvelgerProps } from 'app/components/person-velger/Personvelger';
import { Personvalg } from 'app/models/types/Personvalg';
import yup, { barn } from 'app/rules/yup';
import { setBarnAction } from 'app/state/actions/IdentActions';
import { Formik, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const PersonvelgerMellomlagring = (props: Pick<PersonvelgerProps, 'sokersIdent'>) => {
    const { values } = useFormikContext();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setBarnAction(values.barn.map((barnet: Personvalg) => barnet.norskIdent)));
    }, [values]);

    return <Personvelger sokersIdent={props.sokersIdent} name="barn" populerMedBarn />;
};

const PersonvelgerWrapper = (props: Pick<PersonvelgerProps, 'sokersIdent'>) => (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <Formik initialValues={{ barn: [] }} validationSchema={yup.object({ barn })} onSubmit={() => {}}>
        <PersonvelgerMellomlagring {...props} />
    </Formik>
);

export default PersonvelgerWrapper;
