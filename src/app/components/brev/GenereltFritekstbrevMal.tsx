import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Tag, TextField, Textarea } from '@navikt/ds-react';

import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { validateText } from 'app/utils/validationHelpers';

import VerticalSpacer from '../VerticalSpacer';

interface GenereltFritekstbrevMalProps {
    setVisBrevIkkeSendtInfoboks: () => void;
    setPreviewMessageFeil: () => void;
}

const GenereltFritekstbrevMal: React.FC<GenereltFritekstbrevMalProps> = ({
    setVisBrevIkkeSendtInfoboks,
    setPreviewMessageFeil,
}) => {
    const intl = useIntl();
    const { setFieldValue } = useFormikContext();
    return (
        <>
            <VerticalSpacer sixteenPx />
            <Field
                name={`${BrevFormKeys.fritekstbrev}.overskrift`}
                validate={(value: string) => validateText(value, 200)}
            >
                {({ field, meta }: FieldProps) => (
                    <TextField
                        {...field}
                        onChange={(event) => {
                            setFieldValue(field.name, event.target.value);
                            setPreviewMessageFeil();
                            setVisBrevIkkeSendtInfoboks();
                        }}
                        size="small"
                        label={intl.formatMessage({ id: 'Messages.FritekstTittel' })}
                        maxLength={200}
                        error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                    />
                )}
            </Field>

            <VerticalSpacer sixteenPx />
            <Field
                name={`${BrevFormKeys.fritekstbrev}.brødtekst`}
                validate={(value: string) => validateText(value, 100000)}
            >
                {({ field, meta }: FieldProps) => (
                    <div className="textareaContainer">
                        <Textarea
                            {...field}
                            size="small"
                            onChange={(event) => {
                                setFieldValue(field.name, event.target.value);
                                setPreviewMessageFeil();
                                setVisBrevIkkeSendtInfoboks();
                            }}
                            label={intl.formatMessage({ id: 'Messages.InnholdIBrev' })}
                            maxLength={100000}
                            error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                        />
                        <Tag variant="warning" size="small" className="språkEtikett">
                            Bokmål
                        </Tag>
                    </div>
                )}
            </Field>
        </>
    );
};

export default GenereltFritekstbrevMal;
