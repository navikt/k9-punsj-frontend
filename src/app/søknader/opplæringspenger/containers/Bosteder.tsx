import React from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, ErrorMessage } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { IUtenlandsOpphold, Periode, UtenlandsOpphold } from 'app/models/types';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import intlHelper from 'app/utils/intlUtils';
import { useDatoRestriksjoner } from 'app/hooks/useTillattePerioder';
import Periodevelger from 'app/components/skjema/Datovelger/Periodevelger';

const initialUtenlandsopphold: IUtenlandsOpphold = new UtenlandsOpphold({
    land: '',
    periode: new Periode({ fom: '', tom: '' }),
});

const Bosteder: React.FC = () => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<OLPSoknad>();
    const { fromDate, toDate, disabled } = useDatoRestriksjoner();

    return (
        <Box padding="4" borderWidth="1" borderRadius="large">
            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="metadata.harBoddIUtlandet"
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                onChange={(event) => {
                    const target = event.target as HTMLInputElement;
                    const value = target.value as JaNeiIkkeOpplyst;
                    setFieldValue('metadata.harBoddIUtlandet', value);

                    if (value === JaNeiIkkeOpplyst.JA && values.bosteder.length === 0) {
                        setFieldValue('bosteder', [initialUtenlandsopphold]);
                    }

                    if (value !== JaNeiIkkeOpplyst.JA) {
                        setFieldValue('bosteder', []);
                    }
                }}
                checked={values.metadata.harBoddIUtlandet}
            />

            {values.metadata.harBoddIUtlandet === JaNeiIkkeOpplyst.JA && (
                <FieldArray
                    name="bosteder"
                    render={(arrayHelpers) => (
                        <>
                            {values.bosteder?.map((_, index, array) => (
                                <div key={index}>
                                    <VerticalSpacer thirtyTwoPx />

                                    <div className="fom-tom-rad">
                                        <Periodevelger
                                            name={`bosteder[${index}].periode`}
                                        />

                                        {array.length > 1 && (
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                className="slett-knapp-med-icon-for-input !mt-10"
                                                onClick={() => arrayHelpers.remove(index)}
                                                style={{ float: 'right' }}
                                                icon={<TrashIcon title="slett periode" />}
                                            >
                                                Fjern periode
                                            </Button>
                                        )}
                                    </div>

                                    <VerticalSpacer sixteenPx />

                                    <div style={{ maxWidth: '50%' }}>
                                        <Field name={`bosteder[${index}].land`}>
                                            {({ field, meta: bostederMeta }: FieldProps<string>) => (
                                                <>
                                                <CountrySelect
                                                    label
                                                    selectedcountry={field.value}
                                                    unselectedoption="Velg land"
                                                    {...field}
                                                    />
                                                    {bostederMeta.touched && bostederMeta.error && (
                                                        <ErrorMessage role="alert" showIcon>
                                                            {bostederMeta.error}
                                                        </ErrorMessage>
                                                    )}
                                                    </>
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
                                icon={<PlusCircleIcon title="legg til periode" />}
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
