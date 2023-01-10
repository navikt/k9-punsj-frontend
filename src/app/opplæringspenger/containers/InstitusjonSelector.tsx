import { BodyShort } from '@navikt/ds-react';
import { Autocomplete, FieldError } from '@navikt/ft-plattform-komponenter';
import { useField } from 'formik';
import { Label } from 'nav-frontend-skjema';
import * as React from 'react';
import './institusjonSelector.css';

interface DiagnosekodeSelectorProps {
    label: string;
    name: string;
    hideLabel?: boolean;
}

// const fetchDiagnosekoderByQuery = (queryString: string) =>
//     fetch(`/k9/diagnosekoder/?query=${queryString}&max=8`).then((response) => response.json());

const institusjoner = [
    // { key: 'Stavanger Universitetssykehus', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'St. Olavs Hospital', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sunnaas sykehus', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehus Asker/Bærum', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Buskerud (Drammen sykehus)', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset i Vestfold', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Innlandet Elverum', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Innlandet Gjøvik', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Innlandet Hamar', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Innlandet Kongsvinger', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Innlandet Lillehammer', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Innlandet Tynset', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Telemark', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sykehuset Østfold', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sørlandet sykehus, Arendal', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sørlandet sykehus, Farsund', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sørlandet sykehus, Kristiansand', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    // { key: 'Sørlandet sykehus, Mandal', value: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    { value: 'Stavanger Universitetssykehus', key: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
    { value: 'St. Olavs Hospital', key: '8671b60e-fd47-4097-b005-c376ea0fa240' },
    { value: 'Sunnaas sykehus', key: '053a0d6d-37bc-4618-8dff-b6321e927534' },
];

interface Institusjon {
    key: string;
    value: string;
}

const findInstitusjonValue = (institusjonKey: string) =>
    institusjoner.find((intstitusjon) => intstitusjon.key === institusjonKey)?.value || '';
const findInstitusjonKey = (institusjonValue: string) =>
    institusjoner.find((intstitusjon) => intstitusjon.value === institusjonValue)?.key;

const InstitusjonSelector = ({ label, name, hideLabel }: DiagnosekodeSelectorProps): JSX.Element => {
    const [field, meta, helpers] = useField(name);
    const [suggestions, setSuggestions] = React.useState<Institusjon[]>(institusjoner);
    const [inputValue, setInputValue] = React.useState(findInstitusjonValue(field.value));
    const [isLoading, setIsLoading] = React.useState(false);
    // React.useEffect(() => {
    //     const getInitialDiagnosekode = async () => {
    //         const diagnosekode = await getUpdatedSuggestions(initialDiagnosekodeValue);
    //         if (diagnosekode.length > 0 && diagnosekode[0].value) {
    //             setInputValue(diagnosekode[0].value);
    //         }
    //     };
    //     getInitialDiagnosekode();
    // }, [initialDiagnosekodeValue]);

    const onInputValueChange = async (v: string) => {
        const newSuggestionList = institusjoner.filter(
            (intstitusjon) =>
                intstitusjon.value.toLowerCase().indexOf(v.toLowerCase()) > -1 || intstitusjon.key.indexOf(v) > -1
        );
        setSuggestions(newSuggestionList);
    };

    return (
        <div className="institusjonContainer">
            <div className={hideLabel ? 'institusjonContainer__hideLabel' : ''}>
                <Label htmlFor={name}>{label}</Label>
            </div>
            <div className="institusjonContainer__autocompleteContainer">
                <Autocomplete
                    id={name}
                    suggestions={suggestions}
                    value={inputValue}
                    onChange={(e) => {
                        onInputValueChange(e);
                        setInputValue(e);
                        helpers.setTouched(true);
                    }}
                    onSelect={(e) => {
                        setInputValue(e.value);
                        helpers.setValue(findInstitusjonKey(e.value));
                    }}
                    onBlur={() => {
                        if (!findInstitusjonKey(inputValue)) {
                            helpers.setError('Du må velge en institusjon fra listen');
                        } else {
                            helpers.setError(undefined);
                        }
                    }}
                    ariaLabel={label}
                    placeholder={label}
                    isLoading={isLoading}
                />
            </div>
            {meta.touched && meta.error && <FieldError message={meta.error} />}
        </div>
    );
};

export default InstitusjonSelector;
