import { useField } from 'formik';
import * as React from 'react';

import { Label } from '@navikt/ds-react';
import { Autocomplete, FieldError } from '@navikt/ft-plattform-komponenter';

import { Suggestion } from '@navikt/ft-plattform-komponenter/dist/packages/plattform-komponenter/src/autocomplete/types/Suggestion';
import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';
import './institusjonSelector.css';

interface InstitusjonSelectorProps {
    label: string;
    name: string;
    godkjentOpplæringsinstitusjoner: GodkjentOpplæringsinstitusjon[];
    hentInstitusjonerError: boolean;
    hideLabel?: boolean;
}

const mapTilInstitusjonSuggestions = (institusjoner: GodkjentOpplæringsinstitusjon[]): Suggestion[] =>
    institusjoner.map((institusjon) => ({
        key: institusjon.uuid,
        value: institusjon.navn,
    }));

const InstitusjonSelector = ({
    label,
    name,
    hideLabel,
    godkjentOpplæringsinstitusjoner,
    hentInstitusjonerError,
}: InstitusjonSelectorProps): JSX.Element => {
    const [field, meta, helpers] = useField(name);
    const [institusjoner, setInstitusjoner] = React.useState<Suggestion[]>(
        mapTilInstitusjonSuggestions(godkjentOpplæringsinstitusjoner),
    );

    const findInstitusjonValue = (institusjonKey: string) =>
        institusjoner.find((intstitusjon) => intstitusjon.key === institusjonKey)?.value || '';

    const findInstitusjonKey = (institusjonValue: string) =>
        institusjoner.find((intstitusjon) => intstitusjon.value === institusjonValue)?.key;

    const [valgtInstitusjon, setValgtInstitusjon] = React.useState(findInstitusjonValue(field.value));

    const onInputValueChange = async (v: string) => {
        const nyInstitusjonsListe = institusjoner.filter(
            (intstitusjon) =>
                intstitusjon.value.toLowerCase().indexOf(v.toLowerCase()) > -1 || intstitusjon.key.indexOf(v) > -1,
        );
        setInstitusjoner(nyInstitusjonsListe);
    };

    return (
        <div className="institusjonContainer">
            <div className={hideLabel ? 'institusjonContainer__hideLabel' : ''}>
                <Label htmlFor={name}>{label}</Label>
            </div>
            <div className="institusjonContainer__autocompleteContainer">
                <Autocomplete
                    id={name}
                    suggestions={institusjoner}
                    value={valgtInstitusjon}
                    onChange={(e) => {
                        onInputValueChange(e);
                        setValgtInstitusjon(e);
                        helpers.setTouched(true);
                    }}
                    onSelect={(e) => {
                        setValgtInstitusjon(e.value);
                        helpers.setValue(findInstitusjonKey(e.value));
                    }}
                    onBlur={() => {
                        if (!findInstitusjonKey(valgtInstitusjon)) {
                            helpers.setError('Du må velge en institusjon fra listen');
                        } else {
                            helpers.setError(undefined);
                        }
                    }}
                    ariaLabel={label}
                    placeholder={label}
                />
            </div>
            {meta.touched && meta.error && <FieldError message={meta.error} />}
            {hentInstitusjonerError && <FieldError message={'Henting av institusjoner feilet'} />}
        </div>
    );
};

export default InstitusjonSelector;
