import { Field, FieldArrayRenderProps, FieldProps, useFormikContext } from 'formik';
import React from 'react';

import { Delete } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import { OLPSoknad } from 'app/models/types/OLPSoknad';

interface UtenlandsoppholdProps {
    fieldArrayIndex: number;
    arrayHelpers: FieldArrayRenderProps;
}

const Utenlandsopphold = ({ arrayHelpers, fieldArrayIndex }: UtenlandsoppholdProps) => {
    const { values } = useFormikContext<OLPSoknad>();

    return (
        <div>
            <VerticalSpacer thirtyTwoPx />
            <div className="fom-tom-rad">
                <DatoInputFormik label="Fra og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.fom`} />
                <DatoInputFormik label="Til og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.tom`} />
                {values.utenlandsopphold.length > 1 && (
                    <Button
                        variant="tertiary"
                        size="small"
                        onClick={() => arrayHelpers.remove(fieldArrayIndex)}
                        style={{ float: 'right' }}
                        icon={<Delete />}
                    >
                        Fjern periode
                    </Button>
                )}
            </div>
            <VerticalSpacer sixteenPx />
            <div style={{ maxWidth: '25%' }}>
                <Field name={`utenlandsopphold[${fieldArrayIndex}].land`}>
                    {({ field, meta }: FieldProps<string>) => (
                        <CountrySelect
                            {...field}
                            selectedcountry={field.value}
                            unselectedoption="Velg land"
                            feil={meta.touched && meta.error}
                        />
                    )}
                </Field>
            </div>
        </div>
    );
};

export default Utenlandsopphold;
