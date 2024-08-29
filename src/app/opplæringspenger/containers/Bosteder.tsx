import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { AddCircle, Delete } from '@navikt/ds-icons';
import { Box, Button } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';

import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { IUtenlandsOpphold } from 'app/models/types';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import intlHelper from 'app/utils/intlUtils';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

const initialUtenlandsopphold: IUtenlandsOpphold = { land: '', innleggelsesperioder: [] };

const Bosteder = () => {
    const intl = useIntl();
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();
    const [harBoddIUtlandet, setHarBoddIUtlandet] = useState<JaNeiIkkeOpplyst | undefined>(undefined);

    return (
        <Box padding="4" borderRadius="small">
            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="medlemskapjanei"
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                onChange={(event) => {
                    const target = event.target as HTMLInputElement;
                    const value = target.value as JaNeiIkkeOpplyst;

                    setHarBoddIUtlandet(value);
                    if (value === JaNeiIkkeOpplyst.JA && values.bosteder.length === 0) {
                        setFieldValue('bosteder', [initialUtenlandsopphold]);
                    }
                    if (value !== JaNeiIkkeOpplyst.JA) {
                        setFieldValue('bosteder', []);
                    }
                }}
                checked={values.bosteder.length > 0 ? JaNeiIkkeOpplyst.JA : harBoddIUtlandet}
            />
            {values.bosteder.length > 0 && (
                <FieldArray
                    name="bosteder"
                    render={(arrayHelpers) => (
                        <>
                            {values.bosteder?.map((_, index, array) => (
                                <div key={index}>
                                    <VerticalSpacer thirtyTwoPx />
                                    <div className="fom-tom-rad">
                                        <DatoInputFormikNew
                                            label="Fra og med"
                                            name={`bosteder[${index}].periode.fom`}
                                        />
                                        <DatoInputFormikNew
                                            label="Til og med"
                                            name={`bosteder[${index}].periode.tom`}
                                        />
                                        {array.length > 1 && (
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                onClick={() => arrayHelpers.remove(index)}
                                                style={{ float: 'right' }}
                                                icon={<Delete />}
                                            >
                                                Fjern periode
                                            </Button>
                                        )}
                                    </div>
                                    <VerticalSpacer sixteenPx />
                                    <div style={{ maxWidth: '25%' }}>
                                        <Field name={`bosteder[${index}].land`}>
                                            {({ field }: FieldProps<string>) => (
                                                <CountrySelect
                                                    label={''}
                                                    selectedcountry={field.value}
                                                    unselectedoption="Velg land"
                                                    {...field}
                                                />
                                            )}
                                        </Field>
                                    </div>
                                </div>
                            ))}
                            <VerticalSpacer sixteenPx />
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => arrayHelpers.push(initialUtenlandsopphold)}
                                icon={<AddCircle />}
                            >
                                Legg til periode
                            </Button>
                        </>
                    )}
                />
            )}
        </Box>
    );
};

export default Bosteder;
