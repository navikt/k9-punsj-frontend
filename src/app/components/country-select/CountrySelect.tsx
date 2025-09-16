import React from 'react';

import { Select, SelectProps } from '@navikt/ds-react';
import { getCountryList } from 'app/utils';

interface Props extends Omit<SelectProps, 'children'> {
    selectedcountry?: string;
    unselectedoption?: string;
}

export const CountrySelect = (props: Props) => {
    const countryList = getCountryList();

    const { unselectedoption, selectedcountry } = props;

    if (unselectedoption) {
        countryList.unshift({ code: '', name: unselectedoption });
    }

    return (
        <Select {...props} value={selectedcountry}>
            <option value="">Velg land</option>
            {countryList.map((country) => (
                <option key={country.code} value={country.code}>
                    {country.name}
                </option>
            ))}
        </Select>
    );
};
