import { FieldArray, useFormikContext } from 'formik';
import React from 'react';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';

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
        <Panel border>
            <Heading size="small" level="5">
                Utenlandsopphold
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
                            Legg til periode
                        </Button>
                    </>
                )}
            />
        </Panel>
    );
};

export default UtenlandsoppholdContainer;
