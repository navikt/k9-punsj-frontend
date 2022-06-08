import React from 'react';
import { finnArbeidsgivere } from 'app/api/api';
import { useQuery } from 'react-query';

import Organisasjon from 'app/models/types/Organisasjon';
import Select from '../formikInput/Select';

interface OwnProps {
    name: string;
    soeker: string;
    disabled: boolean;
}

const Organisasjonsvelger = ({ name, soeker, disabled }: OwnProps) => {
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
    return <Select name={name} label="Organisasjon" options={options} disabled={disabled} />;
};

export default Organisasjonsvelger;
