import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { IPeriode, ITimerOgMinutter, Periodeinfo, PeriodeMedTimerMinutter } from 'app/models/types';
import { FieldArray, Formik } from 'formik';
import React from 'react';
import { arbeidstimerPeriode } from 'app/rules/valideringer';
import * as yup from 'yup';
import TilsynPeriode from './TilsynPeriode';
import VerticalSpacer from '../VerticalSpacer';

const schema = yup.object({
    perioder: yup.array().of(arbeidstimerPeriode),
});

export default function TilsynPeriodeListe({
    perioder,
    lagre,
    heading,
    avbryt,
    soknadsperioder,
}: {
    perioder: Periodeinfo<ITimerOgMinutter>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<ITimerOgMinutter>[]) => void;
    avbryt: () => void;
    soknadsperioder: IPeriode[];
}) {
    const initialValues: { perioder: Periodeinfo<ITimerOgMinutter>[] } = {
        perioder,
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
                                >
                                    <AddCircle /> Legg til periode
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
