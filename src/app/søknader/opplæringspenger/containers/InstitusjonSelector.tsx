import { useField, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

import { UNSAFE_Combobox } from '@navikt/ds-react';

import { ComboboxOption } from '@navikt/ds-react/esm/form/combobox/types';
import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';
import './institusjonSelector.css';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { hentInstitusjoner } from '../api';

interface InstitusjonSelectorProps {
    label: string;
    name: string;
    isAnnetSelected: boolean;
}

const mapTilComboboxOptions = (institusjoner: GodkjentOpplæringsinstitusjon[]): ComboboxOption[] =>
    institusjoner.map((institusjon) => ({
        label: institusjon.navn,
        value: institusjon.uuid,
    }));

const InstitusjonSelector = ({ label, name, isAnnetSelected }: InstitusjonSelectorProps): JSX.Element => {
    const { setFieldValue } = useFormikContext<OLPSoknad>();
    const [field] = useField(`${name}.institusjonsUuid`);
    const [, meta] = useField(`${name}.holder`);

    const {
        mutate: hentInstitusjonerK9,
        error: hentInstitusjonerError,
        isPending: hentInstitusjonerLoading,
        data: institusjoner,
    } = useMutation({
        mutationFn: () => hentInstitusjoner(),
        throwOnError: true,
    });

    useEffect(() => {
        hentInstitusjonerK9();
    }, []);

    const findInstitusjonsNavn = (institusjonUuid: string) =>
        institusjoner?.find((institusjon) => institusjon.uuid === institusjonUuid)?.navn || '';

    const error =
        meta.touched && meta.error
            ? 'Institusjon er et påkrevd felt'
            : hentInstitusjonerError
              ? 'Henting av institusjoner feilet'
              : undefined;

    const mappedOptions = institusjoner ? mapTilComboboxOptions(institusjoner) : [];

    return (
        <div className="institusjonContainer">
            <UNSAFE_Combobox
                label={label}
                size="small"
                options={[{ label: 'Velg institusjon', value: '' }, ...mappedOptions]}
                selectedOptions={[field.value ? findInstitusjonsNavn(field.value) : 'Velg institusjon']}
                disabled={isAnnetSelected || !!hentInstitusjonerError}
                toggleListButton={!isAnnetSelected}
                shouldAutocomplete={true}
                error={error}
                isLoading={hentInstitusjonerLoading}
                onToggleSelected={(option) => {
                    setFieldValue(`${name}.institusjonsUuid`, option);
                    setFieldValue(`${name}.holder`, findInstitusjonsNavn(option));
                }}
            />
        </div>
    );
};

export default InstitusjonSelector;
