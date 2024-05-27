import { FieldArray, useFormikContext } from 'formik';
import React from 'react';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';

import { arbeidstakerInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import Arbeidstaker from './Arbeidstaker';

interface Props {
    søknadsperiodeFraSak?: { fom: string; tom: string };
}

const ArbeidstakerContainer = ({ søknadsperiodeFraSak }: Props) => {
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
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            index={index}
                            antallArbeidsforhold={arbeidstaker.length}
                            slettArbeidsforhold={() => arrayHelpers.remove(index)}
                            søknadsperiodeFraSak={søknadsperiodeFraSak}
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
                        icon={<AddCircle />}
                    >
                        Legg til arbeidsforhold
                    </Button>
                </Panel>
            )}
        />
    );
};

export default ArbeidstakerContainer;
