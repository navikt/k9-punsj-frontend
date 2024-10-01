import React, { ChangeEvent, useEffect, useState } from 'react';
import { getValidationErrors, identifikatorAnnenPart } from 'app/rules/yup';
import { Person } from 'app/models/types';
import { getPersonInfo } from 'app/api/api';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { IdentRules } from 'app/rules';
import { IIdentState } from 'app/models/types/IdentState';

interface Props {
    identState: IIdentState;
    showComponent: boolean;
    setAnnenPart: (annenPart: string) => void;
}
const AnnenPart = ({ showComponent, identState, setAnnenPart }: Props) => {
    const [visFeil, setVisFeil] = useState(false);

    const [annenPartInfo, setAnnenPartInfo] = useState<Person | undefined>(undefined);
    const [annenPartInfoLoading, setAnnenPartInfoLoading] = useState<boolean>(false);
    const [annenPartInfoError, setAnnenPartInfoError] = useState<boolean>(false);

    const validators = [identifikatorAnnenPart];

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
        <div className="mt-5 mb-5">
            <FnrTextField
                labelId="ident.identifikasjon.annenPart"
                value={identState.annenPart}
                loadingPersonsInfo={annenPartInfoLoading}
                errorPersonsInfo={annenPartInfoError}
                person={annenPartInfo}
                errorValidationMessage={visFeil && getValidationErrors(validators, identState)}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
            />
        </div>
    );
};

export default AnnenPart;
