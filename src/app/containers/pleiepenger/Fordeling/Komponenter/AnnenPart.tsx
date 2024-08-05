import React, { ChangeEvent, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import { TextField } from '@navikt/ds-react';

import { getValidationErrors, identifikator } from 'app/rules/yup';
import { Person } from 'app/models/types';
import { getPersonInfo } from 'app/api/api';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { IdentRules } from 'app/rules';

interface Props {
    annenPart: string;
    showComponent: boolean;
    setAnnenPart: (annenPart: string) => void;
}
const AnnenPart = ({ showComponent, annenPart, setAnnenPart }: Props) => {
    const intl = useIntl();
    const [visFeil, setVisFeil] = useState(false);

    const [annenPartInfo, setAnnenPartInfo] = useState<Person | undefined>(undefined);
    const [annenPartInfoLoading, setAnnenPartInfoLoading] = useState<boolean>(false);
    const [annenPartInfoError, setAnnenPartInfoError] = useState<boolean>(false);

    const validators = [identifikator];

    // Trenges dette her?
    useEffect(() => {
        setAnnenPart('');
    }, []);

    const hentAnnenPartInfo = (annenPartFødselsnummer: string) => {
        setAnnenPartInfoError(false);
        setAnnenPartInfoLoading(true);

        getPersonInfo(annenPartFødselsnummer, (response, data: Person) => {
            setAnnenPartInfoLoading(false);
            if (response.status === 200) {
                setAnnenPartInfo(data);
            } else {
                setAnnenPartInfoError(true);
            }
        });
    };

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const identifikatorUtenWhitespace = e.target.value.replace(/\D+/, '');

        setAnnenPartInfo(undefined);

        if (identifikatorUtenWhitespace.length < 12) {
            if (!IdentRules.erUgyldigIdent(identifikatorUtenWhitespace)) {
                hentAnnenPartInfo(identifikatorUtenWhitespace);
            }
            setAnnenPart(identifikatorUtenWhitespace);
        }
    };

    const onBlurHandler = () => setVisFeil(true);

    if (!showComponent) {
        return null;
    }
    return (
        <>
            <FnrTextField
                labelId="ident.identifikasjon.annenPart"
                value={annenPart}
                loadingPersonsInfo={annenPartInfoLoading}
                errorPersonsInfo={annenPartInfoError}
                person={annenPartInfo}
                errorValidationMessage={visFeil && getValidationErrors(validators, annenPart)}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
            />
        </>
    );
};

export default AnnenPart;
