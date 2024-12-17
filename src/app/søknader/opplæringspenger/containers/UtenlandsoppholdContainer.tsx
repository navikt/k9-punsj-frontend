import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { AddCircle } from '@navikt/ds-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import Utenlandsopphold from './Utenlandsopphold';

const utenlandsoppholdInitialValue = {
    periode: { fom: '', tom: '' },
    land: '',
    innleggelsesperioder: [],
};

const UtenlandsoppholdContainer = () => {
    const { values } = useFormikContext<OLPSoknad>();

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                <FormattedMessage id="skjema.utenlandsopphold.utenlandsoppholdContainer.tittle" />
            </Heading>

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
                            icon={<AddCircle />}
                        >
                            <FormattedMessage id="skjema.utenlandsopphold.utenlandsoppholdContainer.leggTil.btn" />
                        </Button>
                    </>
                )}
            />
        </Box>
    );
};

export default UtenlandsoppholdContainer;
