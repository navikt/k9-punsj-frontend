import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';
import { Select } from '@navikt/ds-react';

import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { requiredValue } from 'app/utils/validationHelpers';

import Brevmal from './Brevmal';

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
                    size="small"
                    label={intl.formatMessage({ id: 'Messages.Template' })}
                    placeholder={intl.formatMessage({ id: 'Messages.ChooseTemplate' })}
                    className="w-[400px]"
                    error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
