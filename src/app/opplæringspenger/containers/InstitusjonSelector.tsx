import { useField } from 'formik';
import React, { useState } from 'react';

import { UNSAFE_Combobox } from '@navikt/ds-react';

import { ComboboxOption } from '@navikt/ds-react/esm/form/combobox/types';
import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';
import './institusjonSelector.css';

interface InstitusjonSelectorProps {
    label: string;
    name: string;
    godkjentOpplæringsinstitusjoner: GodkjentOpplæringsinstitusjon[];
    hentInstitusjonerError: boolean;
    isAnnetSelected: boolean;
}

const mapTilComboboxOptions = (institusjoner: GodkjentOpplæringsinstitusjon[]): ComboboxOption[] =>
    institusjoner.map((institusjon) => ({
        label: institusjon.navn,
        value: institusjon.uuid,
    }));

const InstitusjonSelector = ({
    label,
    name,
    godkjentOpplæringsinstitusjoner,
    hentInstitusjonerError,
    isAnnetSelected,
}: InstitusjonSelectorProps): JSX.Element => {
    const [field, meta, helpers] = useField(name);
    const [institusjoner] = useState<ComboboxOption[]>(mapTilComboboxOptions(godkjentOpplæringsinstitusjoner));

    const findInstitusjonsNavn = (institusjonUuid: string) =>
        institusjoner.find((institusjon) => institusjon.value === institusjonUuid)?.label || '';

    const error =
        meta.touched && meta.error
            ? 'Institusjon er et påkrevd felt'
            : hentInstitusjonerError
              ? 'Henting av institusjoner feilet'
              : undefined;

    return (
        <div className="institusjonContainer">
            <UNSAFE_Combobox
                label={label}
                size="medium"
                options={institusjoner}
                selectedOptions={[findInstitusjonsNavn(field.value)]}
                disabled={isAnnetSelected}
                toggleListButton={!isAnnetSelected}
                shouldAutocomplete={true}
                error={error}
                onToggleSelected={(option) => {
                    helpers.setValue(option);
                }}
            />
        </div>
    );
};

export default InstitusjonSelector;
