import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { validateText } from 'app/utils/validationHelpers';
import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { EtikettFokus } from 'nav-frontend-etiketter';
import { Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
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
                            label={intl.formatMessage({ id: 'Messages.Fritekst' })}
                            maxLength={4000}
                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                        />
                        <EtikettFokus mini className="språkEtikett">
                            Bokmål
                        </EtikettFokus>
                    </div>
                )}
            </Field>
        </>
    );
};

export default InnhentDokumentasjonMal;
