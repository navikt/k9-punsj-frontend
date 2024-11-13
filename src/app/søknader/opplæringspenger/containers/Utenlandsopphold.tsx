import React from 'react';

import { Field, FieldArrayRenderProps, FieldProps, useFormikContext } from 'formik';
import { Delete } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { OLPSoknad } from 'app/models/types/OLPSoknad';

interface Props {
    fieldArrayIndex: number;
    arrayHelpers: FieldArrayRenderProps;
}

const Utenlandsopphold: React.FC<Props> = ({ arrayHelpers, fieldArrayIndex }: Props) => {
    const { values } = useFormikContext<OLPSoknad>();

    // TODO: Use intl for tekst
    return (
        <div>
            <VerticalSpacer thirtyTwoPx />

            <div className="fom-tom-rad">
                <DatoInputFormikNew label="Fra og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.fom`} />

                <DatoInputFormikNew label="Til og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.tom`} />

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
                    {({ field }: FieldProps<string>) => (
                        <CountrySelect label {...field} selectedcountry={field.value} unselectedoption="Velg land" />
                    )}
                </Field>
            </div>
        </div>
    );
};

export default Utenlandsopphold;
