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

    return (
        <div>
            <VerticalSpacer thirtyTwoPx />

            <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                    <DatoInputFormikNew label="Fra og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.fom`} />
                    <DatoInputFormikNew label="Til og med" name={`utenlandsopphold[${fieldArrayIndex}].periode.tom`} />
                </div>
                {values.utenlandsopphold.length > 1 && (
                    <div className="block content-center">
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => arrayHelpers.remove(fieldArrayIndex)}
                            icon={<Delete />}
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
