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

    if (countryList.length <= 2) {
        // eslint-disable-next-line no-console
        console.log('[country-debug] CountrySelect received short country list', {
            id: props.id,
            label: props.label,
            selectedcountry,
            unselectedoption,
            countryListCount: countryList.length,
            countryListSample: countryList.slice(0, 5),
        });
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
