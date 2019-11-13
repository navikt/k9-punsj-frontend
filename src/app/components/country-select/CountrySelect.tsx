import countries from "i18n-iso-countries";
import * as React from "react";

import {Select, SelectProps} from "nav-frontend-skjema";

import {getLocaleFromSessionStorage} from "../../utils/localeUtils";

interface ICountrySelectProps extends Omit<SelectProps, 'children'> {
    selectedCountry?:  string;
    unselectedOption?: string;
}

interface ICountry {
    code: string;
    name: string;
}

export const CountrySelect = (props: ICountrySelectProps) => {

    const locale = getLocaleFromSessionStorage();
    countries.registerLocale(require(`i18n-iso-countries/langs/${locale}.json`));

    const countryList: ICountry[] = [];
    Object.keys(countries.getAlpha3Codes()).map(code => countryList.push({code, name: countries.getName(code, locale)}));
    countryList.sort((a,b) => (a.name > b.name) ? 1 : -1);
    if (!!props.unselectedOption) {countryList.unshift({code: '', name: props.unselectedOption})}

    return (<Select {...props}>
        {countryList.map(country => <option
            key={country.code}
            value={country.code}
            selected={props.selectedCountry === country.code}
        >{country.name}</option>)}
    </Select>);
};