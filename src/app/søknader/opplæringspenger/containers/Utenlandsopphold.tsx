import React from 'react';

import { Field, FieldArrayRenderProps, FieldProps, useFormikContext } from 'formik';
import { TrashIcon } from '@navikt/aksel-icons';
import { Button, ErrorMessage } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import PeriodevelgerFormik from 'app/components/skjema/Datovelger/PeriodevelgerFormik';
import { useDatoRestriksjoner } from 'app/hooks/useTillattePerioder';

interface Props {
    fieldArrayIndex: number;
    arrayHelpers: FieldArrayRenderProps;
}

const Utenlandsopphold: React.FC<Props> = ({ arrayHelpers, fieldArrayIndex }: Props) => {
    const { values } = useFormikContext<OLPSoknad>();
    const { fromDate, toDate, disabled } = useDatoRestriksjoner();

    return (
        <div className={fieldArrayIndex > 0 ? 'pt-8' : ''}>
            <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                    <PeriodevelgerFormik
                        name={`utenlandsopphold[${fieldArrayIndex}].periode`}
                        fromDate={fromDate}
                        toDate={toDate}
                        disabled={disabled}
                        size="small"
                    />
                </div>
                {values.utenlandsopphold.length > 1 && (
                    <div className="block content-center">
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => arrayHelpers.remove(fieldArrayIndex)}
                            icon={<TrashIcon />}
                            className="slett-knapp-med-icon-for-input !mt-10"
                        >
                            Fjern periode
                        </Button>
                    </div>
                )}
            </div>

            <VerticalSpacer sixteenPx />

            <div className="w-full max-w-sm">
                <Field name={`utenlandsopphold[${fieldArrayIndex}].land`}>
                    {({ field, meta }: FieldProps<string>) => (
                        <>
                        <CountrySelect
                            className="w-full"
                            label
                            size="small"
                            {...field}
                            selectedcountry={field.value}
                            unselectedoption="Velg land"
                        />
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
