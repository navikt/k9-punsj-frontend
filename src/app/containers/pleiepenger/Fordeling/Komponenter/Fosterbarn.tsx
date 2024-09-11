import { AddPerson, Delete } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
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

    const dispatch = useDispatch<Dispatch<any>>();
    const identState = useSelector((state: RootStateType) => state.identState);

    const updateIdentState = (updatedBarn: string[]) => {
        dispatch(setFosterbarnAction(updatedBarn));
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const identFromInput = event.target.value.replace(/\D+/, '');

        const updatedArray = fosterbarnArray.map((item, i) => (i === index ? identFromInput : item));

        const identFromState = identState.fosterbarn?.find((_, i) => i === index);
        if (identFromState && identFromState.length > 0 && identFromInput.length < identFromState.length) {
            // TODO: Slett ident??
            updateIdentState(updatedArray);
        }
        if (identFromInput.length === 11) {
            updateIdentState(updatedArray);
        }
        setFosterbarnArray(updatedArray);
    };

    const addBarn = () => {
        setFosterbarnArray((prevArray) => [...prevArray, '']);
    };

    const removeBarn = (index: number) => {
        const updatedArray = fosterbarnArray.filter((_, i) => i !== index);
        updateIdentState(updatedArray);
        setFosterbarnArray(updatedArray);
    };

    console.log('TEST fosterBarnArray: ', fosterbarnArray);

    return (
        <div className="mt-4 mb-4">
            {fosterbarnArray.map((barn, index) => {
                return (
                    <div className="flex mt-4 mb-4" key={index}>
                        <FnrTextField
                            labelId="ident.identifikasjon.fosterbarn"
                            value={barn}
                            loadingPersonsInfo={false}
                            errorPersonsInfo={false}
                            // person={pleietrengendeInfo}
                            /*errorValidationMessage={
                            isPleitrengendeFnrErSammeSomSøker ||
                            (identState.pleietrengendeId && IdentRules.erUgyldigIdent(identState.pleietrengendeId))
                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                : undefined
                        }*/
                            onChange={(e) => onChange(e, index)}
                        />
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
                );
            })}
            <Button variant="tertiary" size="small" icon={<AddPerson />} iconPosition="left" onClick={addBarn}>
                Legg til fosterbarn
            </Button>
        </div>
    );
};

export default Fosterbarn;
