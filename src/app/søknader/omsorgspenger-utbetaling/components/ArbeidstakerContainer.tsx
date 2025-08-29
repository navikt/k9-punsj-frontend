import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
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
                <>
                    {arbeidstaker.map((v, index) => (
                        <Arbeidstaker
                            key={index}
                            index={index}
                            antallArbeidsforhold={arbeidstaker.length}
                            slettArbeidsforhold={() => arrayHelpers.remove(index)}
                            søknadsperiodeFraSak={søknadsperiodeFraSak}
                        />
                    ))}

                    <div className="mt-4 mb-4">
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() =>
                                arrayHelpers.push({
                                    ...arbeidstakerInitialValue,
                                })
                            }
                            icon={<PlusCircleIcon />}
                        >
                            <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstakerContainer.leggTil.btn" />
                        </Button>
                    </div>
                </>
            )}
        />
    );
};

export default ArbeidstakerContainer;
