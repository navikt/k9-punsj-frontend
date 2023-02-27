import { Tag } from '@navikt/ds-react';
import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { validateText } from 'app/utils/validationHelpers';
import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { Input, Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import VerticalSpacer from '../VerticalSpacer';

interface GenereltFritekstbrevMalProps {
    setVisBrevIkkeSendtInfoboks: () => void;
}

const GenereltFritekstbrevMal: React.FC<GenereltFritekstbrevMalProps> = ({ setVisBrevIkkeSendtInfoboks }) => {
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
                    <Input
                        {...field}
                        label={intl.formatMessage({ id: 'Messages.FritekstTittel' })}
                        maxLength={200}
                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
                            onChange={(event) => {
                                setFieldValue(field.name, event.target.value);
                                setVisBrevIkkeSendtInfoboks();
                            }}
                            label={intl.formatMessage({ id: 'Messages.Fritekst' })}
                            maxLength={100000}
                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
