import { AddCircle } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær, IOMPUTSoknad } from '../types/OMPUTSoknad';
import Arbeidstaker from './Arbeidstaker';

const ArbeidstakerContainer = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    return (
        <Panel>
            <FieldArray
                name="fravaersperioder"
                render={(arrayHelpers) => (
                    <div>
                        {values.fravaersperioder
                            .filter((v) => v.aktivitetsFravær === aktivitetsFravær.AT)
                            ?.map((v) => (
                                <Arbeidstaker index={values.fravaersperioder.indexOf(v)} arrayHelpers={arrayHelpers} />
                            ))}
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
                            Legg til arbeidsforhold
                        </Button>
                    </div>
                )}
            />
        </Panel>
    );
};

export default ArbeidstakerContainer;
