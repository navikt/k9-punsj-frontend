import { FormikValues, useField, useFormikContext } from 'formik';
import React from 'react';
import DatoInputFormikNew from './DatoInputFormikNew';

interface OwnProps {
    label: string;
    name: string;
    className?: string;
    handleBlur?: (callback: () => void, values: any) => void;
}

const DatoInputFormik = ({ label, name, handleBlur, ...props }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();
    return <DatoInputFormikNew label={label} {...field} {...props} errorMessage={meta.touched && meta.error} />;
};

export default DatoInputFormik;
