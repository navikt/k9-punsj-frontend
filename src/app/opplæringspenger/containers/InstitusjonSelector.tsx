import { useField } from 'formik';
import * as React from 'react';

import { Label } from '@navikt/ds-react';
import { Autocomplete, FieldError } from '@navikt/ft-plattform-komponenter';

import './institusjonSelector.css';

interface DiagnosekodeSelectorProps {
    label: string;
    name: string;
    hideLabel?: boolean;
}

// const fetchDiagnosekoderByQuery = (queryString: string) =>
//     fetch(`/k9/diagnosekoder/?query=${queryString}&max=8`).then((response) => response.json());

const institusjoner = [
    { value: 'Sykehus Asker/Bærum', key: 'e381480a-a0e8-4199-b963-82ef5ebbb9f3' },
    { value: 'Sykehuset Buskerud (Drammen sykehus)', key: '503c6d3d-6c97-4de6-9ce8-5d3fbc45488c' },
    { value: 'Sykehuset i Vestfold', key: 'b2c5b913-40ed-4557-93cc-08f525bee5a9' },
    { value: 'Sykehuset Innlandet Elverum', key: '45ac3eda-6e3e-45f5-99d3-670fbc9aaf52' },
    { value: 'Sykehuset Innlandet Gjøvik', key: 'd0cd1cca-261a-48b2-bf03-65cfad35a810' },
    { value: 'Sykehuset Innlandet Hamar', key: 'b0e72be4-ac00-4dda-bfb6-1f19e2435d47' },
    { value: 'Sykehuset Innlandet Kongsvinger', key: 'b0a41fdf-05a9-4998-8415-8503b6beb70b' },
    { value: 'Sykehuset Innlandet Lillehammer', key: '739ba29f-eaf9-46f9-8e15-e1e48e030211s' },
    { value: 'Sykehuset Innlandet Tynset', key: '2c8424c3-8210-45ed-a982-3938a8afedc3' },
    { value: 'Sykehuset Telemark', key: 'a97e9ab3-1c88-446a-9f44-eed058becff1' },
    { value: 'Sykehuset Østfold', key: 'ea2cb9d3-add5-41fc-b16f-947a2855f6d2' },
    { value: 'Sørlandet sykehus, Arendal', key: '8a839290-d91b-423c-82f7-4b69559791d5' },
    { value: 'Sørlandet sykehus, Farsund', key: '4c10bc2d-2f2b-47a8-ab3b-64bdb5b12e50' },
    { value: 'Sørlandet sykehus, Kristiansand', key: '829dd08f-a6f2-4d42-a318-127057dad1fb' },
    { value: 'Sørlandet sykehus, Mandal', key: '877cc841-a837-4619-8f53-7ee29775de66' },
    { value: 'St. Olavs Hospital', key: '8671b60e-fd47-4097-b005-c376ea0fa240' },
    { value: 'Stavanger Universitetssykehus', key: 'bcbc78d9-465b-48c6-913a-bf9b1eeb0faf' },
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
    console.error('isLoading skal vel settes???', setIsLoading);

    const onInputValueChange = async (v: string) => {
        const newSuggestionList = institusjoner.filter(
            (intstitusjon) =>
                intstitusjon.value.toLowerCase().indexOf(v.toLowerCase()) > -1 || intstitusjon.key.indexOf(v) > -1,
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
