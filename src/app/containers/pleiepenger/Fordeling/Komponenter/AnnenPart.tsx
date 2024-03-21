import React, { ChangeEvent, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import { TextField } from '@navikt/ds-react';

import { getValidationErrors, identifikator } from 'app/rules/yup';

interface Props {
    annenPart: string;
    showComponent: boolean;
    setAnnenPart: (annenPart: string) => void;
}
const AnnenPart = ({ showComponent, annenPart, setAnnenPart }: Props) => {
    const intl = useIntl();
    const [visFeil, setVisFeil] = useState(false);

    const validators = [identifikator];

    // Trenges dette her?
    useEffect(() => {
        setAnnenPart('');
    }, []);

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const identifikatorUtenWhitespace = e.target.value.replace(/\D+/, '');
        if (identifikatorUtenWhitespace.length < 12) {
            setAnnenPart(identifikatorUtenWhitespace);
        }
    };

    const onBlurHandler = () => setVisFeil(true);

    if (!showComponent) {
        return null;
    }
    return (
        <TextField
            label={intlHelper(intl, 'ident.identifikasjon.annenPart')}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
            value={annenPart}
            error={visFeil && getValidationErrors(validators, annenPart)}
            className="bold-label"
            maxLength={11}
            size="small"
        />
    );
};

export default AnnenPart;
