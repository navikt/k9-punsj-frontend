import { AddCircle } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import { arbeidstakerInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import Arbeidstaker from './Arbeidstaker';

const ArbeidstakerContainer = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const {
        opptjeningAktivitet: { arbeidstaker },
    } = values;

    return (
        <FieldArray
            name="opptjeningAktivitet.arbeidstaker"
            render={(arrayHelpers) => (
                <div>
                    {arbeidstaker.map((v, index) => (
                        <Arbeidstaker index={index} arrayHelpers={arrayHelpers} />
                    ))}
                    <Button
                        variant="tertiary"
                        size="small"
                        onClick={() =>
                            arrayHelpers.push({
                                ...arbeidstakerInitialValue,
                            })
                        }
                    >
                        <AddCircle />
                        Legg til arbeidsforhold
                    </Button>
                </div>
            )}
        />
    );
};

export default ArbeidstakerContainer;
