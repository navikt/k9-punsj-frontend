import { FieldArray, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';

import { IPeriode, ITimerOgMinutter, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerOgMinutter as periodeMedTimerOgMinutterSchema } from 'app/rules/yup';

import VerticalSpacer from '../vertical-spacer/VerticalSpacer';
import TilsynPeriode from './TilsynPeriode';

const schema = yup.object({
    perioder: yup.array().of(periodeMedTimerOgMinutterSchema),
});

export default function TilsynPeriodeListe({
    perioder,
    lagre,
    heading,
    avbryt,
    soknadsperioder,
    nyeSoknadsperioder,
}: {
    perioder: Periodeinfo<ITimerOgMinutter>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<ITimerOgMinutter>[]) => void;
    avbryt: () => void;
    soknadsperioder: IPeriode[];
    nyeSoknadsperioder: IPeriode[];
}) {
    const initialValues: { perioder: Periodeinfo<ITimerOgMinutter>[] } = {
        perioder: perioder.length
            ? perioder
            : nyeSoknadsperioder.map((periode) => new PeriodeMedTimerMinutter({ periode })),
    };
    return (
        <Formik initialValues={initialValues} onSubmit={(values) => lagre(values.perioder)} validationSchema={schema}>
            {({ handleSubmit, values }) => (
                <>
                    {heading && <Heading size="small">{heading}</Heading>}
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                {values.perioder.map((periode, index) => (
                                    <TilsynPeriode
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={index}
                                        name={`perioder.${index}`}
                                        soknadsperioder={soknadsperioder}
                                        remove={() => arrayHelpers.remove(index)}
                                    />
                                ))}
                                <Button
                                    variant="tertiary"
                                    onClick={() => arrayHelpers.push(new PeriodeMedTimerMinutter({}))}
                                    icon={<AddCircle />}
                                >
                                    Legg til periode
                                </Button>
                                <VerticalSpacer sixteenPx />
                                <div style={{ display: 'flex' }}>
                                    <Button
                                        style={{ flexGrow: 1, marginRight: '0.9375rem' }}
                                        type="submit"
                                        onClick={() => handleSubmit()}
                                    >
                                        Lagre
                                    </Button>

                                    <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={avbryt}>
                                        Avbryt
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </>
            )}
        </Formik>
    );
}
