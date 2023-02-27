import { Search } from '@navikt/ds-react';
import { useField } from 'formik';
import React from 'react';

interface SearchFormikProps {
    label: string;
    name: string;
}

const SearchFormik = ({ label, name }: SearchFormikProps) => {
    const [field, meta] = useField(name);

    return <Search label={label} variant="simple" hideLabel={false} error={meta.touched && meta.error} {...field} />;
};

export default SearchFormik;
