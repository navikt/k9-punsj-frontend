import React, { useEffect, useState } from 'react';

import { Button } from '@navikt/ds-react';
import { TrashIcon, PersonPlusIcon } from '@navikt/aksel-icons';
import { getPersonInfo } from 'app/api/api';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { Person } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { IdentRules } from 'app/validation';
import { FormattedMessage } from 'react-intl';

interface Props {
    identState: IIdentState;

    setFosterbarnIdentState: (updatedBarn?: string[]) => void;
}

const Fosterbarn: React.FC<Props> = ({ identState, setFosterbarnIdentState }: Props) => {
    const [fosterbarnArray, setFosterbarnArray] = useState<string[]>(identState.fosterbarn || []);
    const [fosterbarnInfo, setFosterbarnInfo] = useState<Array<Person | null>>([]);
    const [fosterbarnInfoLoadingIndex, setFosterbarnInfoLoadingIndex] = useState<number | undefined>();
    const [fosterbarnInfoErrors, setFosterbarnInfoErrors] = useState<boolean[]>([]);
    const [updateFosterbarnInfo, setUpdateFosterbarnInfo] = useState<boolean>(true);

    const hentFosterbarnInfo = (fosterbarnsFødselsnummer: string, index: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            const updatedErrors = [...fosterbarnInfoErrors];
            updatedErrors[index] = false;

            setFosterbarnInfoErrors(updatedErrors);
            setFosterbarnInfoLoadingIndex(index);

            getPersonInfo(fosterbarnsFødselsnummer, (response, data: Person) => {
                setFosterbarnInfoLoadingIndex(undefined);
                if (response.status === 200) {
                    setFosterbarnInfo((prevFosterbarnInfo) => {
                        const updatedArray = [...(prevFosterbarnInfo || [])];
                        updatedArray.splice(index, 1, data); // Insert the new item at the specified index
                        return updatedArray;
                    });

                    resolve();
                } else {
                    updatedErrors[index] = true;
                    setFosterbarnInfoErrors(updatedErrors);
                    reject(new Error('Failed to fetch person info'));
                }
            });
        });
    };

    useEffect(() => {
        const fetchFosterbarnInfo = async () => {
            if (updateFosterbarnInfo && fosterbarnArray.length > 0 && fosterbarnInfo && fosterbarnInfo.length === 0) {
                for (const [index, item] of fosterbarnArray.entries()) {
                    try {
                        if (item) {
                            await hentFosterbarnInfo(item, index);
                        }
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error('Error fetching fosterbarn info:', error);
                    }
                }
            }
        };

        fetchFosterbarnInfo();
    }, [fosterbarnArray, fosterbarnInfo]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (updateFosterbarnInfo) {
            setUpdateFosterbarnInfo(false);
        }

        const identFromInput = event.target.value.replace(/\D+/, '');
        const updatedArray = fosterbarnArray.map((item, i) => (i === index ? identFromInput : item));
        const identFromState = identState.fosterbarn?.find((_, i) => i === index);
        const identFromLocalState = fosterbarnArray?.[index];

        if (identFromState && identFromState.length > 0 && identFromInput.length < identFromLocalState.length) {
            // TODO: Slett ident?
            const updatedFosterbarnInfoArray = (fosterbarnInfo || []).slice();
            updatedFosterbarnInfoArray[index] = null;
            setFosterbarnInfo(updatedFosterbarnInfoArray);
            setFosterbarnIdentState(updatedArray);
        }

        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentFosterbarnInfo(identFromInput, index);
            }

            setFosterbarnIdentState(updatedArray);
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

        setFosterbarnIdentState(updatedArray.length === 0 ? undefined : updatedArray);
        setFosterbarnArray(updatedArray);
    };

    const validateFosterbarn = (index: number) => {
        const identFromState = identState.fosterbarn?.find((_, i) => i === index);

        if (!identFromState || identFromState.length === 0) {
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

        return IdentRules.erUgyldigIdent(identFromState) ? 'Ugyldig fødselsnummer' : undefined;
    };

    return (
        <div className="mt-4 mb-4">
            {fosterbarnArray.map((barn, index) => {
                return (
                    <div className="flex items-center mt-4 mb-4" key={index}>
                        <FnrTextField
                            label="ident.identifikasjon.fosterbarn"
                            labelId={`ident.identifikasjon.fosterbarn ${index + 1}`}
                            value={barn}
                            loadingPersonsInfo={fosterbarnInfoLoadingIndex === index}
                            errorPersonsInfo={fosterbarnInfoErrors[index]}
                            person={fosterbarnInfo && fosterbarnInfo[index] ? fosterbarnInfo[index] : undefined}
                            errorValidationMessage={validateFosterbarn(index)}
                            onChange={(e) => onChange(e, index)}
                        />

                        <Button
                            className="slett-knapp-med-icon-for-input"
                            variant="tertiary"
                            icon={<TrashIcon title="slett barn" />}
                            onClick={() => removeBarn(index)}
                        >
                            <FormattedMessage id="fosterbarn.btn.slett" />
                        </Button>
                    </div>
                );
            })}

            <Button
                variant="tertiary"
                size="small"
                icon={<PersonPlusIcon />}
                iconPosition="left"
                onClick={addBarn}
                data-test-id={'leggTillFosterbarnBtn'}
            >
                <FormattedMessage id="fosterbarn.btn.leggTil" />
            </Button>
        </div>
    );
};

export default Fosterbarn;
