import { FieldArray, Formik } from 'formik';
import React, { Fragment } from 'react';
import * as yup from 'yup';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';

import { IPeriode, ITimerOgMinutter, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerOgMinutter as periodeMedTimerOgMinutterSchema } from 'app/rules/yup';

import VerticalSpacer from '../VerticalSpacer';
import TilsynPeriode from './TilsynPeriode';

const schema = yup.object({
    perioder: yup.array().of(periodeMedTimerOgMinutterSchema),
});

export default function TilsynPeriodeListe({
    perioder,
    heading,
    lagre,
    avbryt,
    soknadsperioder,
    nyeSoknadsperioder,
}: {
    perioder: Periodeinfo<ITimerOgMinutter>[];
    heading: string;
    lagre: (tilsynstidInfo: Periodeinfo<ITimerOgMinutter>[]) => void;
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
                    <Heading size="small">{heading}</Heading>
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                {values.perioder.map((periode, index) => (
                                    <div className="mb-8" key={index}>
                                        <TilsynPeriode
                                            name={`perioder.${index}`}
                                            soknadsperioder={soknadsperioder}
                                            remove={() => arrayHelpers.remove(index)}
                                        />
                                    </div>
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
