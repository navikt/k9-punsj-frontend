import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';
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
                <Panel style={{ backgroundColor: '#eaeaea' }}>
                    <Heading size="small" level="5">
                        Arbeidstaker
                    </Heading>
                    {arbeidstaker.map((v, index) => (
                        <Arbeidstaker
                            key={JSON.stringify(v)}
                            index={index}
                            antallArbeidsforhold={arbeidstaker.length}
                            slettArbeidsforhold={() => arrayHelpers.remove(index)}
                        />
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
                </Panel>
            )}
        />
    );
};

export default ArbeidstakerContainer;
