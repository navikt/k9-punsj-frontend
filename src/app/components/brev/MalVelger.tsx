import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { Select } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import Brevmal from './Brevmal';
import { requiredValue } from './validationHelpers';

interface MalVelgerProps {
    resetBrevStatus: () => void;
    brevmaler: Brevmal;
}

const MalVelger: React.FC<MalVelgerProps> = ({ resetBrevStatus, brevmaler }) => {
    const intl = useIntl();
    const { setFieldValue } = useFormikContext();
    const brevmalkoder = Object.keys(brevmaler);

    return (
        <Field name={BrevFormKeys.brevmalkode} validate={requiredValue}>
            {({ field, meta }: FieldProps) => (
                <Select
                    {...field}
                    label={intl.formatMessage({ id: 'Messages.Template' })}
                    placeholder={intl.formatMessage({ id: 'Messages.ChooseTemplate' })}
                    bredde="xxl"
                    feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                    onChange={(event) => {
                        setFieldValue(field.name, event.target.value);
                        resetBrevStatus();
                    }}
                >
                    <option disabled key="default" value="" label="">
                        Velg
                    </option>
                    {brevmalkoder.map((brevmalkode) => (
                        <option key={brevmalkode} value={brevmalkode}>
                            {brevmaler[brevmalkode].navn}
                        </option>
                    ))}
                </Select>
            )}
        </Field>
    );
};

export default MalVelger;
