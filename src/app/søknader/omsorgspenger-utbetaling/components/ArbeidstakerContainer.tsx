import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { AddCircle } from '@navikt/ds-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

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
                <Box padding="4" style={{ backgroundColor: '#eaeaea' }} className="mb-2">
                    <Heading size="small" level="5">
                        <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstakerContainer.arbeidstaker" />
                    </Heading>

                    {arbeidstaker.map((v, index) => (
                        <Arbeidstaker
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
                        <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstakerContainer.leggTil.btn" />
                    </Button>
                </Box>
            )}
        />
    );
};

export default ArbeidstakerContainer;
