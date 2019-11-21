import {getLocaleFromSessionStorage} from 'app/utils';
import countries                     from 'i18n-iso-countries';
import {Select, SelectProps}         from 'nav-frontend-skjema';
import * as React                    from 'react';

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