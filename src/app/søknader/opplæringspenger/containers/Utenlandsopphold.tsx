import React from 'react';

import { Field, FieldArrayRenderProps, FieldProps, useFormikContext } from 'formik';
import { TrashIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';

interface Props {
    fieldArrayIndex: number;
    arrayHelpers: FieldArrayRenderProps;
}

const Utenlandsopphold: React.FC<Props> = ({ arrayHelpers, fieldArrayIndex }: Props) => {
    const { values } = useFormikContext<OLPSoknad>();

    return (
        <div>
            <VerticalSpacer thirtyTwoPx />

            <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                    <DatovelgerFormik label="Fra og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.fom`} />
                    <DatovelgerFormik
                        label="Til og med"
                        name={`utenlandsopphold[${fieldArrayIndex}].periode.tom`}
                        fromDate={
                            values.utenlandsopphold[fieldArrayIndex].periode.fom
                                ? new Date(values.utenlandsopphold[fieldArrayIndex].periode.fom)
                                : undefined
                        }
                        defaultMonth={
                            values.utenlandsopphold[fieldArrayIndex].periode.fom
                                ? new Date(values.utenlandsopphold[fieldArrayIndex].periode.fom)
                                : undefined
                        }
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

            <div style={{ maxWidth: '25%' }}>
                <Field name={`utenlandsopphold[${fieldArrayIndex}].land`}>
                    {({ field }: FieldProps<string>) => (
                        <CountrySelect label {...field} selectedcountry={field.value} unselectedoption="Velg land" />
                    )}
                </Field>
            </div>
        </div>
    );
};

export default Utenlandsopphold;
