import { AddCircle } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import TextField from 'app/components/formikInput/TextField';
import { ArrayHelpers, Field, FieldArray, FieldProps } from 'formik';
import React from 'react';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { Arbeidstaker as ArbeidstakerType } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';

interface OwnProps {
    index: number;
    arrayHelpers: ArrayHelpers;
}

const Arbeidstaker = ({ index: arbeidstakerIndex, arrayHelpers: arbeidstakerArrayHelpers }: OwnProps) => (
    <Field name={`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}]`}>
        {({ field: { value, name } }: FieldProps<ArbeidstakerType>) => (
            <Panel border>
                <TextField label="Organisasjonsnummer" type="number" name={`${name}.organisasjonsnummer`} />
                <FieldArray
                    name={`${name}.fravaersperioder`}
                    render={(arrayHelpers) => (
                        <>
                            {value.fravaersperioder?.map((_fravaersperiode, fravaersperiodeIndex) => (
                                <Fravaersperiode name={`${name}.fravaersperioder[${fravaersperiodeIndex}]`} />
                            ))}
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() =>
                                    arrayHelpers.push({
                                        ...fravaersperiodeInitialValue,
                                        aktivitetsFravær: aktivitetsFravær.ARBEIDSTAKER,
                                    })
                                }
                            >
                                <AddCircle />
                                Legg til periode
                            </Button>
                        </>
                    )}
                />
            </Panel>
        )}
    </Field>
);

export default Arbeidstaker;
