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
    // { key: 'Stavanger Universitetssykehus', value: '1882473' },
    // { key: 'St. Olavs Hospital', value: '1871536' },
    // { key: 'Sunnaas sykehus', value: '1862774' },
    // { key: 'Sykehus Asker/Bærum', value: '1873628' },
    // { key: 'Sykehuset Buskerud (Drammen sykehus)', value: '1875973' },
    // { key: 'Sykehuset i Vestfold', value: '1878077' },
    // { key: 'Sykehuset Innlandet Elverum', value: '1862251' },
    // { key: 'Sykehuset Innlandet Gjøvik', value: '1861395' },
    // { key: 'Sykehuset Innlandet Hamar', value: '1862243' },
    // { key: 'Sykehuset Innlandet Kongsvinger', value: '1862235' },
    // { key: 'Sykehuset Innlandet Lillehammer', value: '1861409' },
    // { key: 'Sykehuset Innlandet Tynset', value: '1862227' },
    // { key: 'Sykehuset Telemark', value: '1878778' },
    // { key: 'Sykehuset Østfold', value: '1873873' },
    // { key: 'Sørlandet sykehus, Arendal', value: '1880896' },
    // { key: 'Sørlandet sykehus, Farsund', value: '1881302' },
    // { key: 'Sørlandet sykehus, Kristiansand', value: '1881469' },
    // { key: 'Sørlandet sykehus, Mandal', value: '1881078' },
    { key: 'Stavanger Universitetssykehus', value: 'Stavanger Universitetssykehus' },
    { key: 'St. Olavs Hospital', value: 'St. Olavs Hospital' },
    { key: 'Sunnaas sykehus', value: 'Sunnaas sykehus' },
    { key: 'Sykehus Asker/Bærum', value: 'Sykehus Asker/Bærum' },
    { key: 'Sykehuset Buskerud (Drammen sykehus)', value: 'Sykehuset Buskerud (Drammen sykehus)' },
    { key: 'Sykehuset i Vestfold', value: 'Sykehuset i Vestfold' },
    { key: 'Sykehuset Innlandet Elverum', value: 'Sykehuset Innlandet Elverum' },
    { key: 'Sykehuset Innlandet Gjøvik', value: 'Sykehuset Innlandet Gjøvik' },
    { key: 'Sykehuset Innlandet Hamar', value: 'Sykehuset Innlandet Hamar' },
    { key: 'Sykehuset Innlandet Kongsvinger', value: 'Sykehuset Innlandet Kongsvinger' },
    { key: 'Sykehuset Innlandet Lillehammer', value: 'Sykehuset Innlandet Lillehammer' },
    { key: 'Sykehuset Innlandet Tynset', value: 'Sykehuset Innlandet Tynset' },
    { key: 'Sykehuset Telemark', value: 'Sykehuset Telemark' },
    { key: 'Sykehuset Østfold', value: 'Sykehuset Østfold' },
    { key: 'Sørlandet sykehus, Arendal', value: 'Sørlandet sykehus, Arendal' },
    { key: 'Sørlandet sykehus, Farsund', value: 'Sørlandet sykehus, Farsund' },
    { key: 'Sørlandet sykehus, Kristiansand', value: 'Sørlandet sykehus, Kristiansand' },
    { key: 'Sørlandet sykehus, Mandal', value: 'Sørlandet sykehus, Mandal' },
];

interface Institusjon {
    key: string;
    value: string;
}

const InstitusjonSelector = ({ label, name, hideLabel }: DiagnosekodeSelectorProps): JSX.Element => {
    const [field, meta, helpers] = useField(name);
    const [suggestions, setSuggestions] = React.useState<Institusjon[]>(institusjoner);
    const [inputValue, setInputValue] = React.useState(field.value);
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

    const onInputValueChange = async (v) => {
        const newSuggestionList = institusjoner.filter(
            (intstitusjon) =>
                intstitusjon.key.toLowerCase().indexOf(v.toLowerCase()) > -1 || intstitusjon.value.indexOf(v) > -1
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
                    }}
                    onSelect={(e) => {
                        setInputValue(e.value);
                        helpers.setValue(e.value);
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
