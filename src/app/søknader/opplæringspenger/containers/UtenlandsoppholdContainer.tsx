import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Box, Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import { LegacyJaNeiIkkeOpplystRadioGroup } from 'app/components/legacy-form-compat/radio';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import Utenlandsopphold from './Utenlandsopphold';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { UtenlandsOpphold } from 'app/models/types';
import { Periode } from 'app/models/types/Periode';

const utenlandsoppholdInitialValue = new UtenlandsOpphold({ land: '', periode: new Periode({ fom: '', tom: '' }) });

const UtenlandsoppholdContainer = () => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    const updateUtenlandsopphold = (jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) => {
        setFieldValue('metadata.harUtenlandsopphold', jaNeiIkkeOpplyst);
        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA && values.utenlandsopphold.length === 0) {
            setFieldValue('utenlandsopphold', [utenlandsoppholdInitialValue]);
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            setFieldValue('utenlandsopphold', []);
        }
    };

    return (
        <>
            <LegacyJaNeiIkkeOpplystRadioGroup
                className="horizontalRadios"
                name="metadata.harUtenlandsopphold"
                legend="Skal søker reise til utlandet i perioden det søkes for?"
                onChange={(_, value) => updateUtenlandsopphold(value)}
                checked={values.metadata.harUtenlandsopphold}
            />
            {values.metadata.harUtenlandsopphold === JaNeiIkkeOpplyst.JA && (
                <Box padding="space-16" borderRadius="8" background="neutral-soft" className="mt-4">
                    <FieldArray
                        name="utenlandsopphold"
                        render={(arrayHelpers) => (
                            <>
                                {values.utenlandsopphold?.map((_, index) => (
                                    <Utenlandsopphold key={index} arrayHelpers={arrayHelpers} fieldArrayIndex={index} />
                                ))}

                                <div className="mt-4">
                                    <Button
                                        variant="tertiary"
                                        size="small"
                                        onClick={() => arrayHelpers.push(utenlandsoppholdInitialValue)}
                                        icon={<PlusCircleIcon title="legg til periode" />}
                                    >
                                        <FormattedMessage id="skjema.utenlandsopphold.utenlandsoppholdContainer.leggTil.btn" />
                                    </Button>
                                </div>
                            </>
                        )}
                    />
                </Box>
            )}
        </>
    );
};

export default UtenlandsoppholdContainer;
