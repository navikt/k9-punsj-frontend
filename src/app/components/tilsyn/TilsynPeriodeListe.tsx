import React, { useRef } from 'react';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { FieldArray, Formik, FormikProps } from 'formik';
import { FormattedMessage } from 'react-intl';
import * as yup from 'yup';

import { IOmsorgstid, IPeriode, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerOgMinutter as periodeMedTimerOgMinutterSchema } from 'app/rules/yup';
import {
    validatePeriodsWithinSoknadsperioder,
    formatSoknadsperioder,
    checkPeriodOverlap,
    processTilsynPeriods,
} from 'app/utils/periodUtils';

import VerticalSpacer from '../VerticalSpacer';
import TilsynPeriode from './TilsynPeriode';
import { Tidsformat } from 'app/utils';

const createValidationSchema = (soknadsperioder: IPeriode[]) =>
    yup.object({
        perioder: yup
            .array()
            .of(periodeMedTimerOgMinutterSchema)
            .test('no-overlap', 'Perioder kan ikke overlappe hverandre', (periods) => {
                if (!periods) return true;
                return !checkPeriodOverlap(periods as Periodeinfo<IOmsorgstid>[]);
            })
            .test(
                'within-soknadsperioder',
                `Tilsyn må være innenfor søknadsperioder. Gyldig intervall: [${formatSoknadsperioder(soknadsperioder)}]`,
                (periods) => {
                    if (!periods) return true;
                    return !validatePeriodsWithinSoknadsperioder(
                        periods as Periodeinfo<IOmsorgstid>[],
                        soknadsperioder,
                    );
                },
            ),
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
            const processedPeriods = processTilsynPeriods(
                currentValues.perioder,
                perioder,
                { filterWeekends: false }, // Kan endres til true hvis vi vil filtrere helger
            );

            lagre(processedPeriods);

            // Reset the form values to the initial state
            formikRef.current?.resetForm();
        }
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={handleSaveValues}
            validationSchema={createValidationSchema(soknadsperioder)}
            innerRef={formikRef}
            // enableReinitialize
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
                                <Alert variant="error" size="small" className="mb-4">
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
                                icon={<PlusCircleIcon />}
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
