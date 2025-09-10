import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { PersonPlusIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import Utenlandsopphold from './Utenlandsopphold';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
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
        <Box padding="4" borderRadius="large" className="bg-bg-subtle">
            <Heading size="small" level="5">
                <FormattedMessage id="skjema.utenlandsopphold.utenlandsoppholdContainer.tittle" />
            </Heading>

            <RadioPanelGruppe
                className="horizontalRadios"
                radios={[
                    { label: 'Ja', value: JaNeiIkkeOpplyst.JA },
                    { label: 'Nei', value: JaNeiIkkeOpplyst.NEI },
                    { label: 'Ikke opplyst', value: JaNeiIkkeOpplyst.IKKE_OPPLYST },
                ]}
                name="metadata.harUtenlandsopphold"
                legend="Skal søker reise til utlandet i perioden det søkes for?"
                onChange={(event) =>
                    updateUtenlandsopphold((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                }
                checked={values.metadata.harUtenlandsopphold}
            />
            {values.metadata.harUtenlandsopphold === JaNeiIkkeOpplyst.JA && (
                <FieldArray
                    name="utenlandsopphold"
                    render={(arrayHelpers) => (
                        <>
                            {values.utenlandsopphold?.map((_, index) => (
                                <Utenlandsopphold key={index} arrayHelpers={arrayHelpers} fieldArrayIndex={index} />
                            ))}

                            <VerticalSpacer sixteenPx />

                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => arrayHelpers.push(utenlandsoppholdInitialValue)}
                                icon={<PersonPlusIcon />}
                            >
                                <FormattedMessage id="skjema.utenlandsopphold.utenlandsoppholdContainer.leggTil.btn" />
                            </Button>
                        </>
                    )}
                />
            )}
        </Box>
    );
};

export default UtenlandsoppholdContainer;
