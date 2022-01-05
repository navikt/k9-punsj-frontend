import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { Person } from 'app/models/types';
import Organisasjon from 'app/models/types/Organisasjon';
import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import { Select } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import VerticalSpacer from '../VerticalSpacer';
import { requiredValue } from './validationHelpers';

interface MottakerVelgerProps {
    resetBrevStatus: () => void;
    aktørId: string;
    person?: Person;
    arbeidsgivereMedNavn: Organisasjon[];
}

const MottakerVelger: React.FC<MottakerVelgerProps> = ({ resetBrevStatus, aktørId, person, arbeidsgivereMedNavn }) => {
    const intl = useIntl();
    const { setFieldValue } = useFormikContext();

    return (
        <>
            <VerticalSpacer sixteenPx />
            <Field name={BrevFormKeys.mottaker} validate={requiredValue}>
                {({ field, meta }: FieldProps) => (
                    <Select
                        {...field}
                        label={intl.formatMessage({ id: 'Messages.Recipient' })}
                        placeholder={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
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
                        {aktørId && person && (
                            <option value={aktørId}>{`${person.sammensattNavn} - ${person.identitetsnummer}`}</option>
                        )}
                        {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                            <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                                {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>
        </>
    );
};

export default MottakerVelger;
