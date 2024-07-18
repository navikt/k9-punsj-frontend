import { ErrorMessage, Label, TextField } from '@navikt/ds-react';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PersonInfo from '../person-info/PersonInfo';
import { Person } from 'app/models/types';

interface Props {
    labelId: string;
    value: string;
    loadingPersonsInfo: boolean;
    errorPersonsInfo: boolean;
    person?: Person;
    errorValidationMessage?: string;
    disabled?: boolean;

    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FnrTextField: React.FC<Props> = ({
    labelId,
    loadingPersonsInfo,
    errorPersonsInfo,
    person,
    errorValidationMessage,
    value,
    disabled,

    onChange,
}) => {
    return (
        <div className="mt-6">
            <Label htmlFor={labelId}>
                <FormattedMessage id={labelId} />
            </Label>

            <div className="flex mt-3">
                <TextField
                    id={labelId}
                    label={<FormattedMessage id={labelId} />}
                    hideLabel
                    value={value}
                    onChange={onChange}
                    autoComplete="off"
                    htmlSize={27}
                    maxLength={11}
                    disabled={disabled}
                />

                {!disabled && <PersonInfo loading={loadingPersonsInfo} error={errorPersonsInfo} person={person} />}
            </div>

            {errorValidationMessage !== undefined && (
                <div className="mt-2">
                    <ErrorMessage size="medium">
                        <li>{errorValidationMessage}</li>
                    </ErrorMessage>
                </div>
            )}
        </div>
    );
};

export default FnrTextField;
