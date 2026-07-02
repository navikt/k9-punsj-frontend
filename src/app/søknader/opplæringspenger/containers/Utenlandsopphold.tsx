import React from 'react';

import { Field, FieldArrayRenderProps, FieldProps, useFormikContext } from 'formik';
import { TrashIcon } from '@navikt/aksel-icons';
import { Button, ErrorMessage } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import PeriodevelgerFormik from 'app/components/period-input/PeriodevelgerFormik';
import { useDatoRestriksjoner } from 'app/hooks/useTillattePerioder';

interface Props {
    fieldArrayIndex: number;
    arrayHelpers: FieldArrayRenderProps;
}

const Utenlandsopphold: React.FC<Props> = ({ arrayHelpers, fieldArrayIndex }: Props) => {
    const { values } = useFormikContext<OLPSoknad>();
    const { fromDate, toDate, disabled } = useDatoRestriksjoner();

    return (
        <div>
            <VerticalSpacer thirtyTwoPx />

            <PeriodevelgerFormik
                name={`utenlandsopphold[${fieldArrayIndex}].periode`}
                fromDate={fromDate}
                toDate={toDate}
                disabled={disabled}
                size="small"
                action={
                    values.utenlandsopphold.length > 1 ? (
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => arrayHelpers.remove(fieldArrayIndex)}
                            icon={<TrashIcon />}
                            className="slett-knapp-med-icon-for-input"
                        >
                            Fjern periode
                        </Button>
                    ) : undefined
                }
            />

            <VerticalSpacer sixteenPx />

            <div style={{ maxWidth: '50%' }}>
                <Field name={`utenlandsopphold[${fieldArrayIndex}].land`}>
                    {({ field, meta }: FieldProps<string>) => (
                        <>
                        <CountrySelect label {...field} selectedcountry={field.value} unselectedoption="Velg land" />
                        {meta.touched && meta.error && (
                            <ErrorMessage role="alert" showIcon>
                                {meta.error}
                            </ErrorMessage>
                        )}
                        </>
                    )}
                </Field>
            </div>
        </div>
    );
};

export default Utenlandsopphold;
