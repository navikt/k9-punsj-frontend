import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Tag, Textarea } from '@navikt/ds-react';

import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { validateText } from 'app/utils/validationHelpers';

import VerticalSpacer from '../VerticalSpacer';

interface InnhentDokumentasjonMalProps {
    setVisBrevIkkeSendtInfoboks: () => void;
}

const InnhentDokumentasjonMal: React.FC<InnhentDokumentasjonMalProps> = ({ setVisBrevIkkeSendtInfoboks }) => {
    const intl = useIntl();
    const { setFieldValue } = useFormikContext();

    return (
        <>
            <VerticalSpacer sixteenPx />
            <Field name={BrevFormKeys.fritekst} validate={(value: string) => validateText(value, 4000)}>
                {({ field, meta }: FieldProps) => (
                    <div className="textareaContainer">
                        <Textarea
                            {...field}
                            onChange={(event) => {
                                setFieldValue(field.name, event.target.value);
                                setVisBrevIkkeSendtInfoboks();
                            }}
                            label={intl.formatMessage({ id: 'Messages.InnholdIBrev' })}
                            maxLength={4000}
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

export default InnhentDokumentasjonMal;
