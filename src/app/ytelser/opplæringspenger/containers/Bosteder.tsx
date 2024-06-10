import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { IUtenlandsOpphold } from 'app/models/types';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import intlHelper from 'app/utils/intlUtils';

const initialUtenlandsopphold: IUtenlandsOpphold = { land: '', innleggelsesperioder: [] };

const Bosteder = () => {
    const intl = useIntl();
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();
    const [harBoddIUtlandet, setHarBoddIUtlandet] = useState<JaNeiIkkeOpplyst | undefined>(undefined);

    return (
        <Panel border>
            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="medlemskapjanei"
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                onChange={(event) => {
                    const { value } = event.target;
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
                                // eslint-disable-next-line react/no-array-index-key
                                <div key={index}>
                                    <VerticalSpacer thirtyTwoPx />
                                    <div className="fom-tom-rad">
                                        <DatoInputFormik label="Fra og med" name={`bosteder[${index}].periode.fom`} />
                                        <DatoInputFormik label="Til og med" name={`bosteder[${index}].periode.tom`} />
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
                                            {({ field, meta }: FieldProps<string>) => (
                                                <CountrySelect
                                                    selectedcountry={field.value}
                                                    unselectedoption="Velg land"
                                                    feil={meta.touched && meta.error}
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
        </Panel>
    );
};

export default Bosteder;
