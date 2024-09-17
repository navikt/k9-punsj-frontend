import { AddPerson, Delete } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import { getPersonInfo } from 'app/api/api';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { Person } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { setFosterbarnAction, setIdentFellesAction } from 'app/state/actions/IdentActions';
import { RootStateType } from 'app/state/RootState';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

interface Props {
    // Define props here
}

const Fosterbarn: React.FC<Props> = (props) => {
    const [fosterbarnArray, setFosterbarnArray] = useState<string[]>([]);
    const [fosterbarnInfo, setFosterbarnInfo] = useState<Array<Person | null>>([]);
    const [fosterbarnInfoLoadingIndex, setFosterbarnInfoLoadingIndex] = useState<number | undefined>();
    const [fosterbarnInfoErrors, setFosterbarnInfoErrors] = useState<boolean[]>([]);

    const dispatch = useDispatch<Dispatch<any>>();
    const identState = useSelector((state: RootStateType) => state.identState);

    const updateIdentState = (updatedBarn: string[]) => {
        dispatch(setFosterbarnAction(updatedBarn));
    };

    const hentFosterbarnInfo = (fosterbarnsFødselsnummer: string, index: number) => {
        const updatedErrors = fosterbarnInfoErrors.slice();
        updatedErrors[index] = false;
        setFosterbarnInfoErrors(updatedErrors);
        setFosterbarnInfoLoadingIndex(index);

        getPersonInfo(fosterbarnsFødselsnummer, (response, data: Person) => {
            setFosterbarnInfoLoadingIndex(undefined);
            if (response.status === 200) {
                const updatedArray = (fosterbarnInfo || []).slice(); // Create a copy of the array
                updatedArray.splice(index, 1, data); // Insert the new item at the specified index

                setFosterbarnInfo(updatedArray);
            } else {
                updatedErrors[index] = true;
                setFosterbarnInfoErrors(updatedErrors);
            }
        });
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const identFromInput = event.target.value.replace(/\D+/, '');

        const updatedArray = fosterbarnArray.map((item, i) => (i === index ? identFromInput : item));

        const identFromState = identState.fosterbarn?.find((_, i) => i === index);
        if (identFromState && identFromState.length > 0 && identFromInput.length < identFromState.length) {
            // TODO: Slett ident??
            const updatedFosterbarnInfoArray = (fosterbarnInfo || []).slice();
            updatedFosterbarnInfoArray[index] = null;
            setFosterbarnInfo(updatedFosterbarnInfoArray);
            updateIdentState(updatedArray);
        }
        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentFosterbarnInfo(identFromInput, index);
            }
            updateIdentState(updatedArray);
        }
        setFosterbarnArray(updatedArray);
    };

    const addBarn = () => {
        setFosterbarnArray((prevArray) => [...prevArray, '']);
    };

    const removeBarn = (index: number) => {
        const updatedArray = fosterbarnArray.filter((_, i) => i !== index);
        const updatedInfoArray = fosterbarnInfo.filter((_, i) => i !== index);
        const updatedErrors = fosterbarnInfoErrors.filter((_, i) => i !== index);

        setFosterbarnInfoErrors(updatedErrors);
        setFosterbarnInfo(updatedInfoArray);

        updateIdentState(updatedArray);
        setFosterbarnArray(updatedArray);
    };
    const validateFosterbarn = (index: number) => {
        const identFromState = identState.fosterbarn?.find((_, i) => i === index);

        if (!identFromState || identFromState.length === 0) {
            // return 'Feltet må fylles ut';
            return undefined;
        }

        if (identState.søkerId === identFromState) {
            return 'Barnets fødselsnummer kan ikke vare søkers fødselsnummer';
        }

        if (identState.annenSokerIdent === identFromState) {
            return 'Barnets fødselsnummer kan ikke vare annen søkers fødselsnummer';
        }

        if (identState.annenPart === identFromState) {
            return 'Barnets fødselsnummer kan ikke vare annen parts fødselsnummer';
        }

        const hasDuplicate = identState.fosterbarn?.some((item, i) => i !== index && item === identFromState);

        if (hasDuplicate) {
            return 'Du kan ikke legge til samme fosterbarn flere ganger';
        }
        console.log('TEST: ', IdentRules.erUgyldigIdent(identFromState));
        return IdentRules.erUgyldigIdent(identFromState) ? 'Ugyldig fødselsnummer' : undefined;
    };
    console.log('TEST ERROS', fosterbarnInfoErrors);
    return (
        <div className="mt-4 mb-4">
            {fosterbarnArray.map((barn, index) => {
                return (
                    <div className="flex mt-4 mb-4" key={index}>
                        <FnrTextField
                            labelId="ident.identifikasjon.fosterbarn"
                            value={barn}
                            loadingPersonsInfo={fosterbarnInfoLoadingIndex === index}
                            errorPersonsInfo={fosterbarnInfoErrors[index]}
                            person={fosterbarnInfo && fosterbarnInfo[index] ? fosterbarnInfo[index] : undefined}
                            errorValidationMessage={validateFosterbarn(index)}
                            onChange={(e) => onChange(e, index)}
                        />
                        <div className="flex items-center ml-2 mt-6">
                            <Button
                                className="slett"
                                variant="tertiary"
                                size="small"
                                iconPosition="left"
                                icon={<Delete />}
                                onClick={() => removeBarn(index)}
                            >
                                Slett
                            </Button>
                        </div>
                    </div>
                );
            })}
            <Button variant="tertiary" size="small" icon={<AddPerson />} iconPosition="left" onClick={addBarn}>
                Legg til fosterbarn
            </Button>
        </div>
    );
};

export default Fosterbarn;
