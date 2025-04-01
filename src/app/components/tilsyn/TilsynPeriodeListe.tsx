import React, { useRef } from 'react';

import { AddCircle } from '@navikt/ds-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { FieldArray, Formik, FormikProps } from 'formik';
import { FormattedMessage } from 'react-intl';
import * as yup from 'yup';

import { IOmsorgstid, IPeriode, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerOgMinutter as periodeMedTimerOgMinutterSchema } from 'app/rules/yup';

import VerticalSpacer from '../VerticalSpacer';
import TilsynPeriode from './TilsynPeriode';
import { formats, Tidsformat } from 'app/utils';
import dayjs from 'dayjs';
import { checkPeriodOverlapTilsyn } from './utils';

const validationSchema = yup.object({
    perioder: yup
        .array()
        .of(periodeMedTimerOgMinutterSchema)
        .test('no-overlap', 'Perioder kan ikke overlappe hverandre', (periods) => {
            if (!periods) return true;
            return !checkPeriodOverlapTilsyn(periods as Periodeinfo<IOmsorgstid>[]);
        }),
});
interface FormValues {
    perioder: Periodeinfo<IOmsorgstid>[];
}

interface Props {
    perioder: Periodeinfo<IOmsorgstid>[];
    soknadsperioder: IPeriode[];

    lagre: (tilsynstidInfo: Periodeinfo<IOmsorgstid>[]) => void;
    avbryt: () => void;
}

const TilsynPeriodeListe = (props: Props) => {
    const formikRef = useRef<FormikProps<FormValues>>(null);

    const { perioder, soknadsperioder } = props;
    const { lagre, avbryt } = props;

    const initialValues: { perioder: Periodeinfo<IOmsorgstid>[] } = {
        perioder: [
            new PeriodeMedTimerMinutter({
                periode: { fom: '', tom: '' },
                timer: '0',
                minutter: '0',
                perDagString: '',
                tidsformat: Tidsformat.TimerOgMin,
            }),
        ],
    };

    const handleSaveValues = (values?: { perioder: Periodeinfo<IOmsorgstid>[] }) => {
        const currentValues = values || formikRef.current?.values;

        if (currentValues) {
            // Starter med eksisterende perioder
            let allPeriods: Periodeinfo<IOmsorgstid>[] = [...perioder];

            // Behandler nye perioder
            currentValues.perioder.forEach((newPeriod) => {
                if (!newPeriod || !newPeriod.periode) return;

                const newStart = dayjs(newPeriod.periode.fom, formats.YYYYMMDD);
                const newEnd = dayjs(newPeriod.periode.tom, formats.YYYYMMDD);

                // Behandler hver eksisterende periode
                const updatedPeriods: Periodeinfo<IOmsorgstid>[] = [];

                allPeriods.forEach((existingPeriod) => {
                    if (!existingPeriod.periode) return;

                    const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
                    const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

                    // Hvis eksisterende periode er helt innenfor den nye perioden, hopper vi over den
                    if (newStart.isSameOrBefore(existingStart) && newEnd.isSameOrAfter(existingEnd)) {
                        return;
                    }

                    // Hvis periodene overlapper delvis
                    if (newStart.isSameOrBefore(existingEnd) && newEnd.isSameOrAfter(existingStart)) {
                        // Hvis ny periode er helt innenfor eksisterende periode
                        if (newStart.isSameOrAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) {
                            // Deler opp eksisterende periode i tre deler
                            if (existingStart.isBefore(newStart)) {
                                updatedPeriods.push({
                                    ...existingPeriod,
                                    periode: {
                                        fom: existingStart.format(formats.YYYYMMDD),
                                        tom: newStart.subtract(1, 'day').format(formats.YYYYMMDD),
                                    },
                                });
                            }
                            if (newEnd.isBefore(existingEnd)) {
                                updatedPeriods.push({
                                    ...existingPeriod,
                                    periode: {
                                        fom: newEnd.add(1, 'day').format(formats.YYYYMMDD),
                                        tom: existingEnd.format(formats.YYYYMMDD),
                                    },
                                });
                            }
                        }
                        // Hvis ny periode overlapper delvis
                        else {
                            if (newStart.isBefore(existingStart)) {
                                updatedPeriods.push({
                                    ...newPeriod,
                                    periode: {
                                        fom: newStart.format(formats.YYYYMMDD),
                                        tom: existingStart.subtract(1, 'day').format(formats.YYYYMMDD),
                                    },
                                });
                            }
                            if (newEnd.isAfter(existingEnd)) {
                                updatedPeriods.push({
                                    ...newPeriod,
                                    periode: {
                                        fom: existingEnd.add(1, 'day').format(formats.YYYYMMDD),
                                        tom: newEnd.format(formats.YYYYMMDD),
                                    },
                                });
                            }
                        }
                    } else {
                        // Hvis periodene ikke overlapper, beholder eksisterende periode
                        updatedPeriods.push(existingPeriod);
                    }
                });

                // Legger til den nye perioden
                updatedPeriods.push(newPeriod);
                allPeriods = updatedPeriods;
            });

            lagre(allPeriods);

            // Reset the form values to the initial state
            formikRef.current?.resetForm();
        }
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={handleSaveValues}
            validationSchema={validationSchema}
            innerRef={formikRef}
            enableReinitialize
        >
            {({ handleSubmit, values, errors, touched }) => (
                <FieldArray
                    name="perioder"
                    render={(arrayHelpers) => (
                        <div>
                            <Heading level="1" size="medium">
                                <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.tittel" />
                            </Heading>

                            {values.perioder.map((_, index) => (
                                <div className="mb-8" key={index}>
                                    <TilsynPeriode
                                        name={`perioder.${index}`}
                                        soknadsperioder={soknadsperioder}
                                        remove={() => arrayHelpers.remove(index)}
                                    />
                                </div>
                            ))}

                            {touched.perioder && errors.perioder && typeof errors.perioder === 'string' && (
                                <Alert variant="error" className="mb-4">
                                    {errors.perioder}
                                </Alert>
                            )}

                            <Button
                                variant="tertiary"
                                onClick={() =>
                                    arrayHelpers.push(
                                        new PeriodeMedTimerMinutter({
                                            periode: { fom: '', tom: '' },
                                            timer: '0',
                                            minutter: '0',
                                            perDagString: '',
                                            tidsformat: Tidsformat.TimerOgMin,
                                        }),
                                    )
                                }
                                icon={<AddCircle />}
                            >
                                <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.leggTil.btn" />
                            </Button>

                            <VerticalSpacer sixteenPx />

                            <div className="flex">
                                <Button type="submit" className="flex-grow mr-4" onClick={() => handleSubmit()}>
                                    <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.lagre.btn" />
                                </Button>

                                <Button
                                    variant="tertiary"
                                    onClick={() => {
                                        formikRef.current?.resetForm();
                                        avbryt();
                                    }}
                                    className="flex-grow"
                                >
                                    <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.avbryt.btn" />
                                </Button>
                            </div>
                        </div>
                    )}
                />
            )}
        </Formik>
    );
};

export default TilsynPeriodeListe;
