import React from 'react';
import { finnArbeidsgivere } from 'app/api/api';
import { useQuery } from 'react-query';

import Organisasjon from 'app/models/types/Organisasjon';
import SelectFormik, { FormikSelectProps } from '../formikInput/SelectFormik';

interface OwnProps extends Partial<FormikSelectProps> {
    name: string;
    soeker: string;
}

const Organisasjonsvelger = ({ name, soeker, disabled, className }: OwnProps) => {
    const { data: organisasjoner } = useQuery<Organisasjon[]>('organisasjoner', () =>
        finnArbeidsgivere(soeker).then((response) => {
            if (response.ok) {
                return response.json().then((json) => json.organisasjoner);
            }
            return [];
        })
    );

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
