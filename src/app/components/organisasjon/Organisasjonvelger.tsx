import React from 'react';

import Organisasjon from 'app/models/types/Organisasjon';
import SelectFormik, { FormikSelectProps } from '../formikInput/SelectFormik';

interface OwnProps extends Partial<FormikSelectProps> {
    name: string;
    organisasjoner?: Organisasjon[];
}

const Organisasjonsvelger = ({ name, organisasjoner, disabled, className }: OwnProps) => {
    const organisasjonOptions =
        organisasjoner?.map((organisasjon) => ({
            label: `${organisasjon.navn} - ${organisasjon.organisasjonsnummer}`,
            value: organisasjon.organisasjonsnummer,
        })) || [];

    const options = [{ label: 'Velg organisasjon', value: '' }, ...organisasjonOptions];
    return (
        <SelectFormik
            className={className}
            name={name}
            label="Organisasjon"
            options={options}
            disabled={disabled}
            size="small"
        />
    );
};

export default Organisasjonsvelger;
