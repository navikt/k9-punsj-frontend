import { AddCircle } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import DatoInput from 'app/components/formikInput/DatoInput';
import TextField from 'app/components/formikInput/TextField';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../types/OMPUTSoknad';

interface OwnProps {
    index: number;
    arrayHelpers: FieldArrayRenderProps;
}

const Arbeidstaker = ({ index, arrayHelpers }: OwnProps) => {
    const { values } = useFormikContext();
    return (
        <>
            <TextField
                label="Organisasjonsnummer"
                type="number"
                name={`fravaersperioder[${index}].organisasjonsnummer`}
            />
            <DatoInput label="Fra og med" name={`fravaersperioder[${index}].periode.fom`} />
            <DatoInput label="Til og med" name={`fravaersperioder[${index}].periode.tom`} />
            <TextField label="Faktisk arbeidet timer" size="small" name={`fravaersperiode[${index}].faktiskTidPrDag`} />
            <div>
                <Button
                    variant="tertiary"
                    size="small"
                    onClick={() =>
                        arrayHelpers.push({
                            ...fravaersperiodeInitialValue,
                            aktivitetsFravær: aktivitetsFravær.AT,
                        })
                    }
                >
                    <AddCircle />
                    Legg til periode
                </Button>
            </div>
        </>
    );
};

export default Arbeidstaker;
