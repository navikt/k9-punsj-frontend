import * as React from 'react';
import { Select, SelectProps } from '@navikt/ds-react';

import { getCountryList } from 'app/utils';

interface ICountrySelectProps extends Omit<SelectProps, 'children'> {
    selectedcountry?: string;
    unselectedoption?: string;
}

// eslint-disable-next-line import/prefer-default-export
export const CountrySelect = (props: ICountrySelectProps) => {
    const countryList = getCountryList();
    console.log('countryList: ', countryList);
    const { unselectedoption, selectedcountry } = props;
    if (unselectedoption) {
        countryList.unshift({ code: '', name: unselectedoption });
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Select {...props} value={selectedcountry}>
            {countryList.map((country) => (
                <option key={country.code} value={country.code}>
                    {country.name}
                </option>
            ))}
        </Select>
    );
};
